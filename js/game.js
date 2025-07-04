import Player from './player.js';
import Platform from './platform.js';
import Gold from './gold.js';
import Utils from './utils.js';
import Joystick from './joystick.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.player = new Player(200, 500);
        this.platforms = [];
        this.golds = []; // Gold parçaları
        this.camera = { y: 0 };
        this.score = 0;
        this.goldCount = 0; // Gold sayısı
        this.highScore = Utils.getHighScore();
        this.gameState = 'menu'; // 'menu', 'start', 'playing', 'gameOver', 'shop'

        this.keys = {};

        // Karakter sistemi
        this.selectedCharacter = Utils.getSelectedCharacter();
        this.ownedCharacters = Utils.getOwnedCharacters();
        this.totalGold = Utils.getTotalGold();

        // FPS kontrolü için
        this.lastTime = 0;
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;

        this.joystick = new Joystick(document.querySelector('.joystick-container'));

        this.initializePlatforms();
        this.setupEventListeners();
        this.updateUI();

        // Ana menüyü göster
        this.showMainMenu();

        this.gameLoop();
    }

    showMainMenu() {
        this.gameState = 'menu';
        // Total gold'u yeniden yükle (oyun bittikten sonra artmış olabilir)
        this.totalGold = Utils.getTotalGold();
        document.getElementById('mainMenu').classList.remove('hidden');
        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('gameOverScreen').classList.add('hidden');
        document.getElementById('characterShop').classList.add('hidden');
        this.updateMenuUI();
        this.updateGoToMenuBtn();
    }

    showCharacterShop() {
        this.gameState = 'shop';
        // Total gold'u yeniden yükle
        this.totalGold = Utils.getTotalGold();
        const shopElement = document.getElementById('characterShop');
        if (shopElement) {
            shopElement.classList.remove('hidden');
        }
        document.getElementById('mainMenu').classList.add('hidden');
        this.updateShopUI();
        
        // Kısa bir gecikme ile character previews'i tekrar çiz (DOM render sonrası)
        setTimeout(() => {
            this.drawCharacterPreviews();
        }, 50);
        
        this.updateGoToMenuBtn();
    }

    updateMenuUI() {
        document.getElementById('menu-gold-count').textContent = this.totalGold;
        document.getElementById('menu-high-score').textContent = this.highScore;
        document.getElementById('menu-total-gold').textContent = this.totalGold;
    }

    updateShopUI() {
        document.getElementById('shop-gold-count').textContent = this.totalGold;

        // Karakter önizlemelerini güncelle
        this.drawCharacterPreviews();

        // Karakter kartlarını güncelle
        const cards = document.querySelectorAll('.character-card');
        cards.forEach(card => {
            const characterType = card.dataset.character;
            const button = card.querySelector('.character-btn');
            const isOwned = this.ownedCharacters.includes(characterType);
            const isSelected = this.selectedCharacter === characterType;

            card.classList.toggle('selected', isSelected);

            if (isSelected) {
                button.textContent = 'Seçili';
                button.className = 'character-btn selected';
            } else if (isOwned) {
                button.textContent = 'Seç';
                button.className = 'character-btn';
            } else {
                button.textContent = 'Satın Al';
                button.className = 'character-btn';
            }
        });
    }

    drawCharacterPreviews() {
        console.log('Drawing character previews...'); // Debug log
        const previews = {
            'default': { body: '#f39c12', head: '#f39c12' },
            'red': { body: '#e74c3c', head: '#c0392b' },
            'blue': { body: '#3498db', head: '#2980b9' },
            'green': { body: '#27ae60', head: '#229954' },
            'purple': { body: '#9b59b6', head: '#8e44ad' },
            'golden': { body: '#f1c40f', head: '#f39c12' }
        };

        Object.keys(previews).forEach(type => {
            const preview = document.getElementById(`preview-${type}`);
            console.log(`Preview element for ${type}:`, preview); // Debug log
            if (preview) {
                const colors = previews[type];
                
                // Clear any existing content and add more explicit styling
                preview.innerHTML = '';
                preview.style.background = `linear-gradient(135deg, ${colors.body}, ${colors.head})`;
                preview.style.border = `3px solid ${colors.head}`;
                preview.style.minHeight = '65px';
                preview.style.minWidth = '65px';
                preview.style.borderRadius = '50%';
                preview.style.display = 'flex';
                preview.style.alignItems = 'center';
                preview.style.justifyContent = 'center';
                
                // Important: Use !important to override any conflicting styles
                preview.style.setProperty('background', `linear-gradient(135deg, ${colors.body}, ${colors.head})`, 'important');
                
                console.log(`Applied styles to ${type}:`, preview.style.background); // Debug log

                if (type === 'golden') {
                    preview.style.boxShadow = '0 0 20px rgba(241, 196, 15, 0.6)';
                }
            } else {
                console.log(`Element not found: preview-${type}`); // Debug log
            }
        });
    }

    showStartScreen() {
        this.gameState = 'start';
        document.getElementById('startScreen').classList.remove('hidden');
        document.getElementById('gameOverScreen').classList.add('hidden');
        document.getElementById('mainMenu').classList.add('hidden');
        this.updateGoToMenuBtn();
    }

    initializePlatforms() {
        // İlk platform (başlangıç)
        this.platforms.push(new Platform(150, 550, 'normal'));

        // Daha az platform ve daha kolay mesafeler
        for (let i = 0; i < 30; i++) { // 60'tan 30'a düşürdük
            const x = Utils.getRandomFloat(20, this.canvas.width - 100);

            // Daha dengeli mesafeler
            let minGap, maxGap;
            if (i < 15) {
                // İlk 15 platform kolay
                minGap = 40; // 35'ten 40'a 
                maxGap = 55; // 50'den 55'e
            } else if (i < 25) {
                // Sonraki 10 platform orta seviye
                minGap = 50; // 45'ten 50'ye
                maxGap = 65; // 60'tan 65'e
            } else {
                // Son 5 platform biraz daha zor
                minGap = 60; // 55'ten 60'a
                maxGap = 75; // 70'ten 75'e
            }

            const y = 500 - (i * Utils.getRandomFloat(minGap, maxGap));

            let type = 'normal';
            const rand = Math.random();

            // Özel platform oranını daha da azalt
            if (i > 8) { // İlk 8 platform sadece normal
                if (rand < 0.05) type = 'bouncy';     // 0.08'den 0.05'e
                else if (rand < 0.08) type = 'breakable'; // 0.12'den 0.08'e
                else if (rand < 0.12) type = 'moving';    // 0.18'den 0.12'ye
            }

            this.platforms.push(new Platform(x, y, type));

            // Gold üretimi - her 3-4 platformda bir
            if (i > 2 && Math.random() < 0.3) {
                const goldX = Utils.getRandomFloat(30, this.canvas.width - 50);
                const goldY = y - Utils.getRandomFloat(30, 60);
                this.golds.push(new Gold(goldX, goldY));
            }
        }
    }

    setupEventListeners() {
        // Klavye kontrolleri
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;

            if (e.key === ' ') {
                e.preventDefault();
                if (this.gameState === 'start' || this.gameState === 'gameOver') {
                    this.startGame();
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        // Buton kontrolleri
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('restartBtn').addEventListener('click', () => {
            this.startGame();
        });

        // Ana menü butonları
        document.getElementById('playBtn').addEventListener('click', () => {
            this.gameState = 'start';
            document.getElementById('mainMenu').classList.add('hidden');
            document.getElementById('startScreen').classList.remove('hidden');
        });

        document.getElementById('shopBtn').addEventListener('click', () => {
            this.showCharacterShop();
        });

        document.getElementById('shopBackBtn').addEventListener('click', () => {
            this.showMainMenu();
        });

        // Karakter mağazası - Event delegation kullan
        document.addEventListener('click', (e) => {
            if (e.target.closest('.character-card')) {
                const card = e.target.closest('.character-card');
                const characterType = card.dataset.character;
                this.handleCharacterSelection(characterType);
            }
        });

        // İyileştirilmiş mobil kontroller
        const mobileControls = document.querySelector('.mobile-controls');
        if (getComputedStyle(mobileControls).display !== 'none') {
            this.joystick = new Joystick(document.querySelector('.joystick-container'));
        }

        const leftBtn = document.getElementById('leftBtn');
        const rightBtn = document.getElementById('rightBtn');
        const superJumpBtn = document.getElementById('superJumpBtn');

        if (leftBtn) {
            // Touch events
            leftBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.keys['ArrowLeft'] = true;
                leftBtn.classList.add('touching');
                this.addTouchFeedback(leftBtn);
            });
            leftBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.keys['ArrowLeft'] = false;
                leftBtn.classList.remove('touching');
            });
            // Mouse events for testing
            leftBtn.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.keys['ArrowLeft'] = true;
                leftBtn.classList.add('touching');
            });
            leftBtn.addEventListener('mouseup', (e) => {
                e.preventDefault();
                this.keys['ArrowLeft'] = false;
                leftBtn.classList.remove('touching');
            });
            leftBtn.addEventListener('mouseleave', (e) => {
                this.keys['ArrowLeft'] = false;
                leftBtn.classList.remove('touching');
            });
        }

        if (rightBtn) {
            // Touch events
            rightBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.keys['ArrowRight'] = true;
                rightBtn.classList.add('touching');
                this.addTouchFeedback(rightBtn);
            });
            rightBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.keys['ArrowRight'] = false;
                rightBtn.classList.remove('touching');
            });
            // Mouse events for testing
            rightBtn.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.keys['ArrowRight'] = true;
                rightBtn.classList.add('touching');
            });
            rightBtn.addEventListener('mouseup', (e) => {
                e.preventDefault();
                this.keys['ArrowRight'] = false;
                rightBtn.classList.remove('touching');
            });
            rightBtn.addEventListener('mouseleave', (e) => {
                this.keys['ArrowRight'] = false;
                rightBtn.classList.remove('touching');
            });
        }

        if (superJumpBtn) {
            const handleSuperJump = (e) => {
                e.preventDefault();
                if (this.gameState === 'playing' && this.player.superJump()) {
                    this.addTouchFeedback(superJumpBtn);
                    superJumpBtn.classList.add('touching');
                    setTimeout(() => {
                        superJumpBtn.classList.remove('touching');
                    }, 150);
                }
            };

            superJumpBtn.addEventListener('touchstart', handleSuperJump);
            superJumpBtn.addEventListener('click', handleSuperJump);
        }

        // Canvas boyutlandırma
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Modal dışına tıklandığında kapat
        document.getElementById('characterShop').addEventListener('click', (e) => {
            if (e.target.id === 'characterShop') {
                this.showMainMenu();
            }
        });

        // Ana Menüye Dön butonu
        const goToMenuBtn = document.getElementById('goToMenuBtn');
        if (goToMenuBtn) {
            goToMenuBtn.addEventListener('click', () => {
                this.showMainMenu();
            });
        }
        // Ekran durumuna göre butonun görünürlüğünü ayarla
        this.updateGoToMenuBtn();
    }

    addTouchFeedback(button = null) {
        // Güçlü titreşim feedback'i
        if (navigator.vibrate) {
            if (button && button.id === 'superJumpBtn') {
                navigator.vibrate([50, 30, 50]); // Süper jump için özel pattern
            } else {
                navigator.vibrate(40); // Normal butonlar için
            }
        }

        // Button için gelişmiş görsel feedback
        if (button) {
            button.style.transform = 'scale(0.9)';
            button.style.filter = 'brightness(1.2)';

            setTimeout(() => {
                button.style.transform = '';
                button.style.filter = '';
            }, 150);
        }
    }

    resizeCanvas() {
        const container = document.querySelector('.game-container');
        let canvasWidth, canvasHeight;
        if (window.innerWidth <= 768) {
            // Mobil cihazlar için tam boyut optimizasyonu
            const availableHeight = window.innerHeight - 180; // UI ve kontroller için alan bırak
            const availableWidth = window.innerWidth - 20; // Padding için alan

            // Aspect ratio'yu koru (2:3)
            canvasWidth = Math.min(availableWidth, 400);
            canvasHeight = canvasWidth * 1.5;

            if (canvasHeight > availableHeight) {
                canvasHeight = availableHeight;
                canvasWidth = canvasHeight / 1.5;
            }
        } else {
            // Desktop için standart boyut
            canvasWidth = 400;
            canvasHeight = 600;
        }
        // Hem style hem attribute olarak ayarla
        this.canvas.style.width = canvasWidth + 'px';
        this.canvas.style.height = canvasHeight + 'px';
        this.canvas.width = Math.round(canvasWidth);
        this.canvas.height = Math.round(canvasHeight);
    }

    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.goldCount = 0; // Sadece oyun içi gold sayacını sıfırla (total gold korunur)
        this.camera.y = 0;

        this.player = new Player(200, 500, this.selectedCharacter);
        this.platforms = [];
        this.golds = []; // Gold array'ini sıfırla
        this.initializePlatforms();

        this.updateUI();
        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('gameOverScreen').classList.add('hidden');
        document.getElementById('mainMenu').classList.add('hidden');
        this.updateGoToMenuBtn();
    }

    handleInput() {
        if (this.gameState !== 'playing') return;

        let horizontal = 0;
        if (this.joystick) {
            horizontal = this.joystick.horizontal;
        }

        if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A'] || horizontal < -0.1) {
            this.player.moveLeft();
        }

        if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D'] || horizontal > 0.1) {
            this.player.moveRight();
        }

        if (this.keys['s'] || this.keys['S']) {
            if (this.player.superJump()) {
                // Süper jump başarılı - ses efekti veya titreşim eklenebilir
                if (navigator.vibrate) {
                    navigator.vibrate(100);
                }
            }
            // Tuşun tekrar basılmasını engellemek için sıfırla
            this.keys['s'] = false;
            this.keys['S'] = false;
        }
    }

    update() {
        if (this.gameState !== 'playing') return;

        this.handleInput();
        this.player.update(this.canvas);

        // Tüm platformları güncelle
        this.platforms.forEach(platform => {
            platform.update(this.canvas);
        });

        // Goldları güncelle
        this.golds.forEach(gold => {
            gold.update();
        });

        this.checkCollisions();
        this.checkGoldCollisions();
        this.updateCamera();
        this.generatePlatforms();
        this.updateScore();
        this.checkGameOver();
        this.updateUI();
    }

    checkCollisions() {
        const playerBox = this.player.getCollisionBox();

        // Sadece oyuncuya yakın platformları kontrol et
        const nearbyPlatforms = this.platforms.filter(platform => 
            !platform.broken &&
            Math.abs(platform.y - this.player.y) < 50 &&
            Math.abs(platform.x - this.player.x) < 150
        );

        nearbyPlatforms.forEach(platform => {
            const platformBox = {
                x: platform.x,
                y: platform.y,
                width: platform.width,
                height: platform.height
            };

            // İyileştirilmiş çarpışma tespiti - sadece aşağı düşerken
            if (this.player.velocityY > 0 && 
                Utils.checkCollision(playerBox, platformBox) &&
                this.player.y + this.player.height - 15 < platform.y) {

                platform.onPlayerLand(this.player);
                this.player.jump();
            }
        });
    }

    checkGoldCollisions() {
        const playerBox = this.player.getCollisionBox();

        this.golds.forEach(gold => {
            if (!gold.collected) {
                const goldBox = gold.getCollisionBox();

                if (Utils.checkCollision(playerBox, goldBox)) {
                    gold.collect();
                    this.goldCount++;

                    // Gold toplama efekti - titreşim
                    if (navigator.vibrate) {
                        navigator.vibrate(80);
                    }
                }
            }
        });

        // Toplanmış goldları temizle
        this.golds = this.golds.filter(gold => !gold.collected);
    }

    updateCamera() {
        const targetY = this.player.y - this.canvas.height / 2;

        if (targetY < this.camera.y) {
            this.camera.y = targetY;
        }
    }

    generatePlatforms() {
        if (this.platforms.length === 0) return;

        let highestY = Math.min(...this.platforms.map(p => p.y));

        // Basit platform üretimi - daha kolay mesafeler
        while (highestY > this.camera.y - 800) { // 1000'den 800'e
            const x = Utils.getRandomFloat(20, this.canvas.width - 100);
            highestY -= Utils.getRandomFloat(40, 65); // 60-90'dan 40-65'e

            let type = 'normal';
            const rand = Math.random();

            // Daha az özel platform
            if (rand < 0.05) type = 'bouncy';     // 0.1'den 0.05'e
            else if (rand < 0.1) type = 'breakable'; // 0.2'den 0.1'e
            else if (rand < 0.15) type = 'moving';    // 0.3'den 0.15'e

            this.platforms.push(new Platform(x, highestY, type));

            // Gold üretimi - her platformda %25 şans
            if (Math.random() < 0.25) {
                const goldX = Utils.getRandomFloat(30, this.canvas.width - 50);
                const goldY = highestY - Utils.getRandomFloat(25, 50);
                this.golds.push(new Gold(goldX, goldY));
            }
        }

        // Gereksiz platformları temizle
        this.platforms = this.platforms.filter(platform => 
            platform.y < this.camera.y + this.canvas.height + 200
        );

        // Gereksiz goldları temizle
        this.golds = this.golds.filter(gold => 
            gold.y < this.camera.y + this.canvas.height + 200
        );
    }

    updateScore() {
        const newScore = Math.max(0, Math.floor((500 - this.player.y) / 10));
        if (newScore > this.score) {
            this.score = newScore;
        }
    }

    checkGameOver() {
        if (this.player.y > this.camera.y + this.canvas.height + 100) {
            this.gameOver();
        }
    }

    gameOver() {
        this.gameState = 'gameOver';

        // Goldları toplam gold'a ekle
        this.totalGold = Utils.addGold(this.goldCount);

        const isNewRecord = Utils.saveHighScore(this.score);
        this.highScore = Utils.getHighScore();

        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-gold').textContent = this.goldCount;
        document.getElementById('final-high-score').textContent = this.highScore;
        document.getElementById('gameOverScreen').classList.remove('hidden');

        if (isNewRecord) {
            document.querySelector('.game-over-screen h2').textContent = 'Yeni Rekor!';
        } else {
            document.querySelector('.game-over-screen h2').textContent = 'Oyun Bitti!';
        }
    }

    updateUI() {
        document.getElementById('current-score').textContent = this.score;
        document.getElementById('high-score').textContent = this.highScore;
        document.getElementById('gold-count').textContent = this.goldCount;

        // Süper jump UI'ını güncelle
        this.updateSuperJumpUI();
    }

    updateSuperJumpUI() {
        const fill = document.getElementById('superJumpFill');
        const container = document.querySelector('.super-jump-container');
        const mobileBtn = document.getElementById('superJumpBtn');

        if (this.player.superJumpReady) {
            // Süper jump hazır
            fill.style.width = '100%';
            container.classList.add('super-jump-ready');
            document.querySelector('.super-jump-bar').classList.remove('cooling');

            if (mobileBtn) {
                mobileBtn.classList.remove('disabled');
                mobileBtn.classList.add('ready');
            }
        } else {
            // Süper jump cooldown'da
            const percentage = ((this.player.superJumpMaxCooldown - this.player.superJumpCooldown) / this.player.superJumpMaxCooldown) * 100;
            fill.style.width = percentage + '%';
            container.classList.remove('super-jump-ready');
            document.querySelector('.super-jump-bar').classList.add('cooling');

            if (mobileBtn) {
                mobileBtn.classList.add('disabled');
                mobileBtn.classList.remove('ready');
            }
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.ctx.translate(0, -this.camera.y);
        this.drawBackground();

        // Oyun durumuna göre çizim
        if (this.gameState === 'playing' || this.gameState === 'gameOver') {
            // Platformları çiz
            this.platforms.forEach(platform => {
                platform.draw(this.ctx);
            });
            // Goldları çiz
            this.golds.forEach(gold => {
                gold.draw(this.ctx);
            });
            // Oyuncuyu çiz
            this.player.draw(this.ctx);
        }
        // Start, menu, shop ekranlarında canvas'ı boş bırak
        this.ctx.restore();
    }

    drawBackground() {
        // Renkli gradient arka plan
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);

        // Yüksekliğe göre renk değişimi
        const height = -this.camera.y;

        if (height < 500) {
            // Başlangıç - Mavi tonları
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(0.3, '#98D8E8');
            gradient.addColorStop(0.6, '#A8E6F0');
            gradient.addColorStop(1, '#E0F6FF');
        } else if (height < 1500) {
            // Orta seviye - Mor/Pembe tonları
            gradient.addColorStop(0, '#8E44AD');
            gradient.addColorStop(0.3, '#AF7AC5');
            gradient.addColorStop(0.6, '#D2B4DE');
            gradient.addColorStop(1, '#F4ECF7');
        } else if (height < 3000) {
            // Yüksek seviye - Turuncu/Sarı tonları
            gradient.addColorStop(0, '#E67E22');
            gradient.addColorStop(0.3, '#F39C12');
            gradient.addColorStop(0.6, '#F7DC6F');
            gradient.addColorStop(1, '#FCF3CF');
        } else {
            // Çok yüksek - Uzay teması
            gradient.addColorStop(0, '#1B2631');
            gradient.addColorStop(0.3, '#2E4057');
            gradient.addColorStop(0.6, '#546E7A');
            gradient.addColorStop(1, '#78909C');
        }

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Yıldızlar ekle (yüksek seviyede)
        if (height > 2000) {
            this.drawStars();
        }

        // Bulutlar ekle (düşük seviyede)
        if (height < 1000) {
            this.drawClouds();
        }
    }

    drawStars() {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.globalAlpha = 0.8;

        // Kamera pozisyonuna göre yıldız konumları
        const starCount = 15;
        const baseY = Math.floor(this.camera.y / 200) * 200;

        for (let i = 0; i < starCount; i++) {
            const x = (i * 37 + 123) % this.canvas.width;
            const y = baseY + (i * 43 + 67) % 600;

            if (y > this.camera.y - 50 && y < this.camera.y + this.canvas.height + 50) {
                this.drawStar(x, y, 2, 1, 4);
            }
        }

        this.ctx.globalAlpha = 1;
    }

    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';

        // Kamera pozisyonuna göre bulut konumları
        const cloudCount = 8;
        const baseY = Math.floor(this.camera.y / 150) * 150;

        for (let i = 0; i < cloudCount; i++) {
            const x = (i * 67 + 45) % (this.canvas.width + 100) - 50;
            const y = baseY + (i * 89 + 234) % 450;

            if (y > this.camera.y - 100 && y < this.camera.y + this.canvas.height + 100) {
                // Basit bulut çizimi
                this.ctx.beginPath();
                this.ctx.arc(x, y, 15, 0, Math.PI * 2);
                this.ctx.arc(x + 15, y, 20, 0, Math.PI * 2);
                this.ctx.arc(x + 30, y, 15, 0, Math.PI * 2);
                this.ctx.arc(x + 15, y - 10, 15, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }

    drawStar(x, y, outerRadius, innerRadius, points) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.beginPath();

        for (let i = 0; i < points * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / points;
            const px = radius * Math.cos(angle);
            const py = radius * Math.sin(angle);

            if (i === 0) {
                this.ctx.moveTo(px, py);
            } else {
                this.ctx.lineTo(px, py);
            }
        }

        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
    }

    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;

        if (deltaTime >= this.frameInterval) {
            if (this.gameState === 'playing') {
                this.update();
            }
            this.render();
            this.lastTime = currentTime;
        }

        requestAnimationFrame((time) => this.gameLoop(time));
    }

    handleCharacterSelection(characterType) {
        const isOwned = this.ownedCharacters.includes(characterType);
        const price = Utils.getCharacterPrice(characterType);

        if (isOwned) {
            // Karakteri seç
            this.selectedCharacter = characterType;
            Utils.setSelectedCharacter(characterType);
            this.updateShopUI();
        } else {
            // Karakteri satın al
            if (this.totalGold >= price) {
                if (Utils.spendGold(price)) {
                    Utils.addOwnedCharacter(characterType);
                    this.ownedCharacters = Utils.getOwnedCharacters();
                    this.totalGold = Utils.getTotalGold();
                    this.selectedCharacter = characterType;
                    Utils.setSelectedCharacter(characterType);
                    this.updateShopUI();
                    this.updateMenuUI();
                }
            } else {
                alert(`Yeterli altınınız yok! ${price - this.totalGold} daha gold gerekli.`);
            }
        }
    }

    updateGoToMenuBtn() {
        // "Ana Menü" butonunu sadece ana menüde gizle, diğer ekranlarda göster
        const goToMenuBtn = document.getElementById('goToMenuBtn');
        if (!goToMenuBtn) return;
        if (this.gameState === 'menu') {
            goToMenuBtn.classList.add('hidden');
        } else {
            goToMenuBtn.classList.remove('hidden');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
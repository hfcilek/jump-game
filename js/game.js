class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.player = new Player(200, 500);
        this.platforms = [];
        this.camera = { y: 0 };
        this.score = 0;
        this.highScore = Utils.getHighScore();
        this.gameState = 'start';
        
        this.keys = {};
        
        this.initializePlatforms();
        this.setupEventListeners();
        this.updateUI();
        
        // Start screen'i göster
        this.showStartScreen();
        
        this.gameLoop();
    }
    
    showStartScreen() {
        document.getElementById('startScreen').classList.remove('hidden');
        document.getElementById('gameOverScreen').classList.add('hidden');
    }
    
    initializePlatforms() {
        // İlk platform (başlangıç)
        this.platforms.push(new Platform(150, 550, 'normal'));
        
        // Daha az platform ve daha kolay mesafeler
        for (let i = 0; i < 30; i++) { // 60'tan 30'a düşürdük
            const x = Utils.getRandomFloat(20, this.canvas.width - 100);
            
            // Daha kolay mesafeler
            let minGap, maxGap;
            if (i < 15) {
                // İlk 15 platform çok kolay
                minGap = 35; // 45'ten 35'e
                maxGap = 50; // 65'ten 50'ye
            } else if (i < 25) {
                // Sonraki 10 platform orta seviye
                minGap = 45; // 55'ten 45'e
                maxGap = 60; // 75'ten 60'a
            } else {
                // Son 5 platform biraz daha zor
                minGap = 55; // 70'ten 55'e
                maxGap = 70; // 95'ten 70'e
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
        
        // Basit mobil kontroller - sadece temel eventler
        const leftBtn = document.getElementById('leftBtn');
        const rightBtn = document.getElementById('rightBtn');
        
        if (leftBtn) {
            leftBtn.addEventListener('touchstart', () => {
                this.keys['ArrowLeft'] = true;
            });
            leftBtn.addEventListener('touchend', () => {
                this.keys['ArrowLeft'] = false;
            });
        }
        
        if (rightBtn) {
            rightBtn.addEventListener('touchstart', () => {
                this.keys['ArrowRight'] = true;
            });
            rightBtn.addEventListener('touchend', () => {
                this.keys['ArrowRight'] = false;
            });
        }
        
        // Canvas boyutlandırma
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    addTouchFeedback(button = null) {
        // Titreşim feedback'i
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }
        
        // Button için görsel feedback
        if (button) {
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = '';
            }, 100);
        }
    }
    
    resizeCanvas() {
        const container = document.querySelector('.game-container');
        const containerWidth = container.clientWidth - 40;
        
        if (window.innerWidth <= 768) {
            const maxWidth = Math.min(containerWidth, 400);
            this.canvas.style.width = maxWidth + 'px';
            this.canvas.style.height = (maxWidth * 1.5) + 'px';
        } else {
            this.canvas.style.width = '400px';
            this.canvas.style.height = '600px';
        }
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.camera.y = 0;
        
        this.player = new Player(200, 500);
        this.platforms = [];
        this.initializePlatforms();
        
        this.updateUI();
        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('gameOverScreen').classList.add('hidden');
    }
    
    handleInput() {
        if (this.gameState !== 'playing') return;
        
        if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
            this.player.moveLeft();
        }
        
        if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
            this.player.moveRight();
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
        
        this.checkCollisions();
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
        }
        
        // Gereksiz platformları temizle
        this.platforms = this.platforms.filter(platform => 
            platform.y < this.camera.y + this.canvas.height + 200
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
        
        const isNewRecord = Utils.saveHighScore(this.score);
        this.highScore = Utils.getHighScore();
        
        document.getElementById('final-score').textContent = this.score;
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
                if (platform.y > this.camera.y - 50 && 
                    platform.y < this.camera.y + this.canvas.height + 50) {
                    platform.draw(this.ctx);
                }
            });
            
            // Oyuncuyu çiz
            this.player.draw(this.ctx);
        } else if (this.gameState === 'start') {
            // Start ekranında sadece arka planı çiz
            // Platforms ve player çizmeye gerek yok
        }
        
        this.ctx.restore();
    }
    
    drawBackground() {
        // Basit ve güvenilir gradient arka plan
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#E0F6FF');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
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
    
    gameLoop() {
        if (this.gameState === 'playing') {
            this.update();
        }
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Game();
});

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.player = new Player(200, 500);
        this.platforms = [];
        this.camera = { y: 0 };
        this.score = 0;
        this.highScore = Utils.getHighScore();
        this.gameState = 'start'; // 'start', 'playing', 'gameOver'
        
        this.keys = {};
        this.lastTime = 0;
        
        this.initializePlatforms();
        this.setupEventListeners();
        this.updateUI();
        
        // Oyun döngüsünü başlat
        this.gameLoop(0);
    }
    
    initializePlatforms() {
        // İlk platform (başlangıç)
        this.platforms.push(new Platform(150, 550, 'normal'));
        
        // Rastgele platformlar oluştur
        for (let i = 0; i < 50; i++) {
            const x = Utils.getRandomFloat(20, this.canvas.width - 100);
            const y = 500 - (i * Utils.getRandomFloat(80, 120));
            
            let type = 'normal';
            const rand = Math.random();
            
            if (rand < 0.1) type = 'bouncy';
            else if (rand < 0.2) type = 'breakable';
            else if (rand < 0.3) type = 'moving';
            
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
        
        // Geliştirilmiş mobil kontroller
        const leftBtn = document.getElementById('leftBtn');
        const rightBtn = document.getElementById('rightBtn');
        
        // Sol buton kontrolleri
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
        
        leftBtn.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            this.keys['ArrowLeft'] = false;
            leftBtn.classList.remove('touching');
        });
        
        // Sağ buton kontrolleri
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
        
        rightBtn.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            this.keys['ArrowRight'] = false;
            rightBtn.classList.remove('touching');
        });
        
        // Mouse kontrolleri de ekle (desktop'ta test için)
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
        
        // Touch eventlerinin browser default davranışını engelle
        document.addEventListener('touchstart', (e) => {
            if (e.target.classList.contains('mobile-btn')) {
                e.preventDefault();
            }
        }, { passive: false });
        
        document.addEventListener('touchmove', (e) => {
            if (e.target.classList.contains('mobile-btn')) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // Canvas boyutunu responsive hale getir
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    addTouchFeedback(button) {
        // Haptic feedback (destekleyen cihazlarda)
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        // Görsel feedback
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 100);
    }
    
    resizeCanvas() {
        const container = document.querySelector('.game-container');
        const containerWidth = container.clientWidth - 40; // padding
        
        if (window.innerWidth <= 768) {
            const maxWidth = Math.min(containerWidth, 400);
            this.canvas.style.width = maxWidth + 'px';
            this.canvas.style.height = (maxWidth * 1.5) + 'px'; // 2:3 oranı
        } else {
            this.canvas.style.width = '400px';
            this.canvas.style.height = '600px';
        }
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.camera.y = 0;
        
        // Player'ı reset et
        this.player = new Player(200, 500);
        
        // Platformları reset et
        this.platforms = [];
        this.initializePlatforms();
        
        // UI'ı güncelle
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
        
        // Platform güncellemeleri
        this.platforms.forEach(platform => {
            platform.update(this.canvas);
        });
        
        // Çarpışma tespiti
        this.checkCollisions();
        
        // Kamera takibi
        this.updateCamera();
        
        // Yeni platformlar oluştur
        this.generatePlatforms();
        
        // Skor güncelleme
        this.updateScore();
        
        // Oyun bitme kontrolü
        this.checkGameOver();
        
        // UI güncelle
        this.updateUI();
    }
    
    checkCollisions() {
        const playerBox = this.player.getCollisionBox();
        
        this.platforms.forEach(platform => {
            if (platform.broken) return;
            
            const platformBox = {
                x: platform.x,
                y: platform.y,
                width: platform.width,
                height: platform.height
            };
            
            // Sadece aşağı doğru düşerken çarpışma kontrolü
            if (this.player.velocityY > 0 && 
                Utils.checkCollision(playerBox, platformBox) &&
                this.player.y < platform.y) {
                
                platform.onPlayerLand(this.player);
                this.player.jump();
            }
        });
    }
    
    updateCamera() {
        const targetY = this.player.y - this.canvas.height / 2;
        
        // Kamera sadece yukarı hareket etsin
        if (targetY < this.camera.y) {
            this.camera.y = targetY;
        }
    }
    
    generatePlatforms() {
        // En üstteki platformun pozisyonunu bul
        let highestY = Math.min(...this.platforms.map(p => p.y));
        
        // Yeni platformlar ekle
        while (highestY > this.camera.y - 1000) {
            const x = Utils.getRandomFloat(20, this.canvas.width - 100);
            highestY -= Utils.getRandomFloat(80, 120);
            
            let type = 'normal';
            const rand = Math.random();
            
            if (rand < 0.1) type = 'bouncy';
            else if (rand < 0.15) type = 'breakable';
            else if (rand < 0.25) type = 'moving';
            
            this.platforms.push(new Platform(x, highestY, type));
        }
        
        // Ekranın çok altındaki platformları temizle
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
        // Oyuncu ekranın altına düştüyse
        if (this.player.y > this.camera.y + this.canvas.height + 100) {
            this.gameOver();
        }
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        
        // High score kontrolü
        const isNewRecord = Utils.saveHighScore(this.score);
        this.highScore = Utils.getHighScore();
        
        // Game over ekranını göster
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
        // Ekranı temizle
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Kamera transformasyonu
        this.ctx.save();
        this.ctx.translate(0, -this.camera.y);
        
        // Arka plan - bulutlar ve gradient
        this.drawBackground();
        
        // Platformları çiz
        this.platforms.forEach(platform => {
            if (platform.y > this.camera.y - 50 && 
                platform.y < this.camera.y + this.canvas.height + 50) {
                platform.draw(this.ctx);
            }
        });
        
        // Player'ı çiz
        this.player.draw(this.ctx);
        
        this.ctx.restore();
    }
    
    drawBackground() {
        // Geliştirilmiş arka plan efektleri
        const gradient = this.ctx.createLinearGradient(0, this.camera.y, 0, this.camera.y + this.canvas.height);
        gradient.addColorStop(0, 'rgba(135, 206, 235, 0.1)');
        gradient.addColorStop(0.5, 'rgba(224, 246, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(135, 206, 235, 0.1)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, this.camera.y, this.canvas.width, this.canvas.height);
        
        // Bulut efekti
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        
        for (let i = 0; i < 15; i++) {
            const x = (i * 60 + this.camera.y * 0.05) % (this.canvas.width + 80) - 40;
            const y = this.camera.y + (i * 80) + Math.sin(this.camera.y * 0.008 + i) * 30;
            
            // Daha güzel bulut çizimi
            this.ctx.beginPath();
            this.ctx.arc(x, y, 12, 0, Math.PI * 2);
            this.ctx.arc(x + 12, y, 16, 0, Math.PI * 2);
            this.ctx.arc(x + 24, y, 12, 0, Math.PI * 2);
            this.ctx.arc(x + 12, y - 8, 12, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Yıldız efekti (yüksek skorlarda)
        if (this.score > 100) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            for (let i = 0; i < 8; i++) {
                const x = (i * 90 + this.camera.y * 0.02) % this.canvas.width;
                const y = this.camera.y + (i * 120) + Math.sin(this.camera.y * 0.01 + i) * 20;
                
                this.drawStar(x, y, 3, 2, 5);
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
    
    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update();
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Oyunu başlat
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});

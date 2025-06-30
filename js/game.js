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
        
        this.gameLoop();
    }
    
    initializePlatforms() {
        // İlk platform (başlangıç)
        this.platforms.push(new Platform(150, 550, 'normal'));
        
        // Başlangıçta daha kolay platformlar
        for (let i = 0; i < 60; i++) {
            const x = Utils.getRandomFloat(20, this.canvas.width - 100);
            
            // Progresif zorluk - başta kolay, sonra zorlaşır
            let minGap, maxGap;
            if (i < 10) {
                // İlk 10 platform çok kolay
                minGap = 45;
                maxGap = 65;
            } else if (i < 25) {
                // Sonraki 15 platform orta seviye
                minGap = 55;
                maxGap = 75;
            } else if (i < 40) {
                // Sonraki 15 platform biraz zor
                minGap = 65;
                maxGap = 85;
            } else {
                // Geri kalan platformlar normal zorluk
                minGap = 70;
                maxGap = 95;
            }
            
            const y = 500 - (i * Utils.getRandomFloat(minGap, maxGap));
            
            let type = 'normal';
            const rand = Math.random();
            
            // Başlangıçta özel platform oranını azalt
            if (i > 5) { // İlk 5 platform sadece normal
                if (rand < 0.08) type = 'bouncy';
                else if (rand < 0.12) type = 'breakable';
                else if (rand < 0.18) type = 'moving';
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
        
        // Geliştirilmiş mobil kontroller - butonlar
        const leftBtn = document.getElementById('leftBtn');
        const rightBtn = document.getElementById('rightBtn');
        
        this.setupButtonControls(leftBtn, 'ArrowLeft');
        this.setupButtonControls(rightBtn, 'ArrowRight');
        
        // Tam ekran mobil kontroller
        const leftArea = document.getElementById('leftArea');
        const rightArea = document.getElementById('rightArea');
        
        this.setupTouchArea(leftArea, 'ArrowLeft');
        this.setupTouchArea(rightArea, 'ArrowRight');
        
        // Touch eventlerini optimize et
        document.addEventListener('touchstart', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    setupButtonControls(button, key) {
        // Touch events
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys[key] = true;
            button.classList.add('touching');
            this.addTouchFeedback(button);
        });
        
        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.keys[key] = false;
            button.classList.remove('touching');
        });
        
        button.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            this.keys[key] = false;
            button.classList.remove('touching');
        });
        
        // Mouse events
        button.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.keys[key] = true;
            button.classList.add('touching');
        });
        
        button.addEventListener('mouseup', (e) => {
            e.preventDefault();
            this.keys[key] = false;
            button.classList.remove('touching');
        });
        
        button.addEventListener('mouseleave', (e) => {
            this.keys[key] = false;
            button.classList.remove('touching');
        });
    }
    
    setupTouchArea(area, key) {
        // Touch events
        area.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys[key] = true;
            area.classList.add('active');
            this.addTouchFeedback();
        });
        
        area.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.keys[key] = false;
            area.classList.remove('active');
        });
        
        area.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            this.keys[key] = false;
            area.classList.remove('active');
        });
        
        // Mouse events (desktop test için)
        area.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.keys[key] = true;
            area.classList.add('active');
        });
        
        area.addEventListener('mouseup', (e) => {
            e.preventDefault();
            this.keys[key] = false;
            area.classList.remove('active');
        });
        
        area.addEventListener('mouseleave', (e) => {
            this.keys[key] = false;
            area.classList.remove('active');
        });
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
        
        // Basit platform üretimi
        while (highestY > this.camera.y - 1000) {
            const x = Utils.getRandomFloat(20, this.canvas.width - 100);
            highestY -= Utils.getRandomFloat(60, 90);
            
            let type = 'normal';
            const rand = Math.random();
            
            if (rand < 0.1) type = 'bouncy';
            else if (rand < 0.2) type = 'breakable';
            else if (rand < 0.3) type = 'moving';
            
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
        
        // Tüm platformları çiz
        this.platforms.forEach(platform => {
            if (platform.y > this.camera.y - 50 && 
                platform.y < this.camera.y + this.canvas.height + 50) {
                platform.draw(this.ctx);
            }
        });
        
        this.player.draw(this.ctx);
        
        this.ctx.restore();
    }
    
    drawBackground() {
        // Basit gradient arka plan
        const gradient = this.ctx.createLinearGradient(0, this.camera.y, 0, this.camera.y + this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#E0F6FF');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, this.camera.y, this.canvas.width, this.canvas.height);
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
        this.update();
        this.render();
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Game();
});

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 30;
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 5;
        this.jumpPower = -15; // Artırıldı (eski: -12)
        this.superJumpPower = -25; // Süper jump gücü
        this.gravity = 0.4;
        this.maxFallSpeed = 15;
        this.direction = 1;
        this.onGround = false;
        
        // Süper jump özellikleri
        this.superJumpCooldown = 0;
        this.superJumpMaxCooldown = 180; // 3 saniye (60 FPS'de)
        this.superJumpReady = true;
        this.superJumpEffect = 0; // Görsel efekt için
    }
    
    update(canvas) {
        // Yatay hareket
        this.x += this.velocityX;
        
        // Ekran sınırları - wrap around
        if (this.x + this.width < 0) {
            this.x = canvas.width;
        } else if (this.x > canvas.width) {
            this.x = -this.width;
        }
        
        // Dikey hareket ve yerçekimi
        this.velocityY += this.gravity;
        if (this.velocityY > this.maxFallSpeed) {
            this.velocityY = this.maxFallSpeed;
        }
        
        this.y += this.velocityY;
        
        // Yatay sürtünme
        this.velocityX *= 0.8;
        
        // Yön belirleme
        if (this.velocityX > 0.1) {
            this.direction = 1;
        } else if (this.velocityX < -0.1) {
            this.direction = -1;
        }
        
        // Süper jump cooldown güncelleme
        if (this.superJumpCooldown > 0) {
            this.superJumpCooldown--;
            this.superJumpReady = false;
        } else {
            this.superJumpReady = true;
        }
        
        // Süper jump efekti azaltma
        if (this.superJumpEffect > 0) {
            this.superJumpEffect--;
        }
        
        this.onGround = false;
    }
    
    moveLeft() {
        this.velocityX = Math.max(this.velocityX - 0.8, -this.speed);
    }
    
    moveRight() {
        this.velocityX = Math.min(this.velocityX + 0.8, this.speed);
    }
    
    jump() {
        this.velocityY = this.jumpPower;
        this.onGround = true;
    }
    
    superJump() {
        if (this.superJumpReady) {
            this.velocityY = this.superJumpPower;
            this.superJumpCooldown = this.superJumpMaxCooldown;
            this.superJumpEffect = 30; // 0.5 saniye efekt
            this.onGround = true;
            return true; // Başarılı süper jump
        }
        return false; // Süper jump kullanılamıyor
    }
    
    draw(ctx) {
        ctx.save();
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // Süper jump efekti
        if (this.superJumpEffect > 0) {
            const effectIntensity = this.superJumpEffect / 30;
            
            // Parlak halka efekti
            ctx.globalAlpha = effectIntensity * 0.8;
            ctx.fillStyle = '#f39c12';
            ctx.beginPath();
            ctx.arc(centerX, centerY, 25 * effectIntensity, 0, Math.PI * 2);
            ctx.fill();
            
            // İç halka
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.arc(centerX, centerY, 15 * effectIntensity, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.globalAlpha = 1;
        }
        
        // Vücut
        ctx.fillStyle = this.superJumpEffect > 0 ? '#e74c3c' : '#f39c12';
        ctx.fillRect(this.x + 4, this.y + 10, this.width - 8, this.height - 15);
        
        // Kafa
        ctx.fillStyle = this.superJumpEffect > 0 ? '#e74c3c' : '#f39c12';
        ctx.beginPath();
        ctx.arc(centerX, this.y + 8, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Gözler
        ctx.fillStyle = '#2c3e50';
        ctx.beginPath();
        ctx.arc(centerX - 3, this.y + 6, 1.5, 0, Math.PI * 2);
        ctx.arc(centerX + 3, this.y + 6, 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Ağız
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerX, this.y + 9, 2, 0, Math.PI);
        ctx.stroke();
        
        // Bacaklar
        ctx.fillStyle = this.superJumpEffect > 0 ? '#c0392b' : '#e67e22';
        if (this.velocityY < 0) {
            // Yukarı zıplarken bacakları büz
            ctx.fillRect(this.x + 6, this.y + this.height - 5, 3, 5);
            ctx.fillRect(this.x + this.width - 9, this.y + this.height - 5, 3, 5);
        } else {
            // Normal bacaklar
            ctx.fillRect(this.x + 6, this.y + this.height - 8, 3, 8);
            ctx.fillRect(this.x + this.width - 9, this.y + this.height - 8, 3, 8);
        }
        
        ctx.restore();
    }
    
    getCollisionBox() {
        return {
            x: this.x + 2,
            y: this.y + this.height - 8, // Biraz daha yüksek çarpışma kutusu
            width: this.width - 4,
            height: 8
        };
    }
}

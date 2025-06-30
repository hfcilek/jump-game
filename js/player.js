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
        this.gravity = 0.4;
        this.maxFallSpeed = 15;
        this.direction = 1;
        this.onGround = false;
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
        
        this.onGround = false;
    }
    
    moveLeft() {
        this.velocityX = -this.speed;
    }
    
    moveRight() {
        this.velocityX = this.speed;
    }
    
    jump() {
        this.velocityY = this.jumpPower;
        this.onGround = true;
    }
    
    draw(ctx) {
        ctx.save();
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // Vücut
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(this.x + 4, this.y + 10, this.width - 8, this.height - 15);
        
        // Kafa
        ctx.fillStyle = '#f39c12';
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
        ctx.fillStyle = '#e67e22';
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

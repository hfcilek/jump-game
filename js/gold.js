class Gold {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.collected = false;
        this.rotation = 0;
        this.pulseScale = 1;
        this.sparkles = [];
        
        // Parıltı efektleri için
        for (let i = 0; i < 5; i++) {
            this.sparkles.push({
                x: Math.random() * 20,
                y: Math.random() * 20,
                opacity: Math.random(),
                speed: Math.random() * 0.02 + 0.01
            });
        }
    }
    
    update() {
        if (this.collected) return;
        
        // Döndürme animasyonu
        this.rotation += 0.05;
        
        // Pulse animasyonu
        this.pulseScale = 1 + Math.sin(Date.now() * 0.005) * 0.1;
        
        // Parıltı animasyonu
        this.sparkles.forEach(sparkle => {
            sparkle.opacity += sparkle.speed;
            if (sparkle.opacity > 1) {
                sparkle.opacity = 0;
                sparkle.x = Math.random() * 20;
                sparkle.y = Math.random() * 20;
            }
        });
    }
    
    draw(ctx) {
        if (this.collected) return;
        
        ctx.save();
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // Parıltı efektleri
        this.sparkles.forEach(sparkle => {
            ctx.globalAlpha = sparkle.opacity * 0.8;
            ctx.fillStyle = '#fff700';
            ctx.beginPath();
            ctx.arc(this.x + sparkle.x, this.y + sparkle.y, 1, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.globalAlpha = 1;
        
        // Ana gold parçası
        ctx.translate(centerX, centerY);
        ctx.rotate(this.rotation);
        ctx.scale(this.pulseScale, this.pulseScale);
        
        // Altın renk gradyanı
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 10);
        gradient.addColorStop(0, '#fff700');
        gradient.addColorStop(0.5, '#ffed4e');
        gradient.addColorStop(1, '#f39c12');
        
        // Gold çember
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // İç parlaklık
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(-2, -2, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Dış halka
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }
    
    getCollisionBox() {
        return {
            x: this.x + 2,
            y: this.y + 2,
            width: this.width - 4,
            height: this.height - 4
        };
    }
    
    collect() {
        this.collected = true;
    }
}

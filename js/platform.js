export default class Platform {
    constructor(x, y, type = 'normal', difficultyLevel = 0) {
        this.x = x;
        this.y = y;
        this.width = 80;
        this.height = 12;
        this.type = type;
        this.broken = false;
        this.moveDirection = 1;
        // Hareketli platformların hızı zorluk seviyesiyle artar
        this.moveSpeed = type === 'moving' ? 1 + (difficultyLevel * 0.15) : 1;
        this.bounced = false;

        // Platform özelliklerine göre renk belirleme
        this.setColor();
    }

    setColor() {
        switch(this.type) {
            case 'normal':
                this.color = '#2ecc71';
                break;
            case 'breakable':
                this.color = '#8b4513';
                break;
            case 'bouncy':
                this.color = '#3498db';
                this.height = 16;
                break;
            case 'moving':
                this.color = '#e74c3c';
                break;
            default:
                this.color = '#2ecc71';
        }
    }

    update(canvas) {
        if (this.type === 'moving' && !this.broken) {
            this.x += this.moveDirection * this.moveSpeed;

            // Ekran sınırlarında geri döndür
            if (this.x <= 0 || this.x >= canvas.width - this.width) {
                this.moveDirection *= -1;
            }
        }
    }

    draw(ctx) {
        if (this.broken) return;

        ctx.fillStyle = this.color;

        // Platform tipine göre çizim
        switch(this.type) {
            case 'bouncy':
                // Yaylı platform - daha kalın ve yuvarlak köşeli
                ctx.fillRect(this.x, this.y, this.width, this.height);
                ctx.fillStyle = '#2980b9';
                ctx.fillRect(this.x + 5, this.y + 2, this.width - 10, 4);
                ctx.fillRect(this.x + 10, this.y + 8, this.width - 20, 4);
                break;

            case 'breakable':
                // Kırılabilir platform - çatlak efekti
                ctx.fillRect(this.x, this.y, this.width, this.height);
                ctx.strokeStyle = '#654321';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(this.x + 20, this.y);
                ctx.lineTo(this.x + 25, this.y + this.height);
                ctx.moveTo(this.x + 50, this.y);
                ctx.lineTo(this.x + 45, this.y + this.height);
                ctx.stroke();
                break;

            case 'moving':
                // Hareketli platform - ok işaretleri
                ctx.fillRect(this.x, this.y, this.width, this.height);
                ctx.fillStyle = '#c0392b';
                // Sol ok
                ctx.beginPath();
                ctx.moveTo(this.x + 10, this.y + 6);
                ctx.lineTo(this.x + 15, this.y + 3);
                ctx.lineTo(this.x + 15, this.y + 9);
                ctx.fill();
                // Sağ ok
                ctx.beginPath();
                ctx.moveTo(this.x + this.width - 10, this.y + 6);
                ctx.lineTo(this.x + this.width - 15, this.y + 3);
                ctx.lineTo(this.x + this.width - 15, this.y + 9);
                ctx.fill();
                break;

            default:
                // Normal platform
                ctx.fillRect(this.x, this.y, this.width, this.height);
                // Highlight efekti
                ctx.fillStyle = '#27ae60';
                ctx.fillRect(this.x, this.y, this.width, 3);
        }
    }

    onPlayerLand(player) {
        if (this.broken) return false;

        switch(this.type) {
            case 'breakable':
                this.broken = true;
                return true;

            case 'bouncy':
                player.velocityY = -18; // Ekstra güçlü zıplama
                return true;

            case 'normal':
            case 'moving':
                return true;

            default:
                return true;
        }
    }
}
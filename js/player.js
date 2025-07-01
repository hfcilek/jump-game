export default class Player {
    constructor(x, y, characterType = 'default') {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 30;
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 3; // Düşürüldü (eski: 5)
        this.jumpPower = -12; // Düşürüldü (eski: -15)
        this.superJumpPower = -20; // Düşürüldü (eski: -25)
        this.gravity = 0.3; // Düşürüldü (eski: 0.4)
        this.maxFallSpeed = 12; // Düşürüldü (eski: 15)
        this.direction = 1;
        this.onGround = false;

        // Süper jump özellikleri
        this.superJumpCooldown = 0;
        this.superJumpMaxCooldown = 180; // 3 saniye (60 FPS'de)
        this.superJumpReady = true;
        this.superJumpEffect = 0; // Görsel efekt için

        // Karakter tipi
        this.characterType = characterType;
        this.characterColors = this.getCharacterColors(characterType);
    }

    getCharacterColors(type) {
        const colors = {
            default: {
                body: '#f39c12',
                head: '#f39c12',
                legs: '#e67e22',
                eyes: '#2c3e50'
            },
            red: {
                body: '#e74c3c',
                head: '#c0392b',
                legs: '#a93226',
                eyes: '#ffffff'
            },
            blue: {
                body: '#3498db',
                head: '#2980b9',
                legs: '#2471a3',
                eyes: '#ffffff'
            },
            green: {
                body: '#27ae60',
                head: '#229954',
                legs: '#1e8449',
                eyes: '#ffffff'
            },
            purple: {
                body: '#9b59b6',
                head: '#8e44ad',
                legs: '#7d3c98',
                eyes: '#ffffff'
            },
            golden: {
                body: '#f1c40f',
                head: '#f39c12',
                legs: '#e67e22',
                eyes: '#2c3e50',
                glow: true
            }
        };
        return colors[type] || colors.default;
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

        // Altın karakter için glow efekti
        if (this.characterColors.glow) {
            ctx.globalAlpha = 0.6;
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        // Süper jump efekti
        if (this.superJumpEffect > 0) {
            const effectIntensity = this.superJumpEffect / 30;

            // Parlak halka efekti
            ctx.globalAlpha = effectIntensity * 0.8;
            ctx.fillStyle = this.characterColors.body;
            ctx.beginPath();
            ctx.arc(centerX, centerY, 25 * effectIntensity, 0, Math.PI * 2);
            ctx.fill();

            // İç halka
            ctx.fillStyle = this.characterColors.head;
            ctx.beginPath();
            ctx.arc(centerX, centerY, 15 * effectIntensity, 0, Math.PI * 2);
            ctx.fill();

            ctx.globalAlpha = 1;
        }

        // Vücut
        ctx.fillStyle = this.superJumpEffect > 0 ? this.characterColors.head : this.characterColors.body;
        ctx.fillRect(this.x + 4, this.y + 10, this.width - 8, this.height - 15);

        // Kafa
        ctx.fillStyle = this.superJumpEffect > 0 ? this.characterColors.head : this.characterColors.body;
        ctx.beginPath();
        ctx.arc(centerX, this.y + 8, 8, 0, Math.PI * 2);
        ctx.fill();

        // Gözler
        ctx.fillStyle = this.characterColors.eyes;
        ctx.beginPath();
        ctx.arc(centerX - 3, this.y + 6, 1.5, 0, Math.PI * 2);
        ctx.arc(centerX + 3, this.y + 6, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Ağız
        ctx.strokeStyle = this.characterColors.eyes;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerX, this.y + 9, 2, 0, Math.PI);
        ctx.stroke();

        // Bacaklar
        ctx.fillStyle = this.superJumpEffect > 0 ? this.characterColors.head : this.characterColors.legs;
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
export default class Utils {
    static getRandomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }

    static getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    static checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    static saveHighScore(score) {
        const currentHigh = localStorage.getItem('doodleJumpHighScore') || 0;
        if (score > currentHigh) {
            localStorage.setItem('doodleJumpHighScore', score);
            return true;
        }
        return false;
    }

    static getHighScore() {
        return parseInt(localStorage.getItem('doodleJumpHighScore')) || 0;
    }

    // Karakter sistemi metodları
    static getSelectedCharacter() {
        return localStorage.getItem('selectedCharacter') || 'default';
    }

    static setSelectedCharacter(character) {
        localStorage.setItem('selectedCharacter', character);
    }

    static getOwnedCharacters() {
        const owned = localStorage.getItem('ownedCharacters');
        return owned ? JSON.parse(owned) : ['default'];
    }

    static addOwnedCharacter(character) {
        const owned = this.getOwnedCharacters();
        if (!owned.includes(character)) {
            owned.push(character);
            localStorage.setItem('ownedCharacters', JSON.stringify(owned));
        }
    }

    static getTotalGold() {
        return parseInt(localStorage.getItem('totalGold')) || 0;
    }

    static addGold(amount) {
        const current = this.getTotalGold();
        const newTotal = current + amount;
        localStorage.setItem('totalGold', newTotal);
        return newTotal;
    }

    static spendGold(amount) {
        const current = this.getTotalGold();
        if (current >= amount) {
            const newTotal = current - amount;
            localStorage.setItem('totalGold', newTotal);
            return true;
        }
        return false;
    }

    static getCharacterPrice(character) {
        const prices = {
            'default': 0,
            'red': 50,
            'blue': 100,
            'green': 200,
            'purple': 500,
            'golden': 1000
        };
        return prices[character] || 0;
    }
}
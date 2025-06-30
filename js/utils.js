// Yardımcı fonksiyonlar
class Utils {
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
}

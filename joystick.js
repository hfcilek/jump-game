export default class Joystick {
    constructor(container) {
        this.container = container;
        this.stick = document.createElement('div');
        this.stick.classList.add('joystick');
        this.container.appendChild(this.stick);

        this.active = false;
        this.x = 0;
        this.y = 0;

        this.stick.addEventListener('mousedown', this.onDown.bind(this));
        this.stick.addEventListener('touchstart', this.onDown.bind(this));

        document.addEventListener('mousemove', this.onMove.bind(this));
        document.addEventListener('touchmove', this.onMove.bind(this));

        document.addEventListener('mouseup', this.onUp.bind(this));
        document.addEventListener('touchend', this.onUp.bind(this));
    }

    onDown(event) {
        this.active = true;
        this.stick.style.transition = '0s';
        this.onMove(event);
    }

    onMove(event) {
        if (this.active) {
            event.preventDefault();
            const touch = event.changedTouches ? event.changedTouches[0] : event;
            const rect = this.container.getBoundingClientRect();
            const x = touch.clientX - rect.left - rect.width / 2;
            const y = touch.clientY - rect.top - rect.height / 2;
            const distance = Math.sqrt(x * x + y * y);
            const maxDistance = rect.width / 2;

            if (distance > maxDistance) {
                this.x = (x / distance) * maxDistance;
                this.y = (y / distance) * maxDistance;
            } else {
                this.x = x;
                this.y = y;
            }

            this.stick.style.transform = `translate(${this.x}px, ${this.y}px)`;
        }
    }

    onUp() {
        if (this.active) {
            this.active = false;
            this.x = 0;
            this.y = 0;
            this.stick.style.transition = '0.2s';
            this.stick.style.transform = `translate(0, 0)`;
        }
    }

    get horizontal() {
        return this.x / (this.container.getBoundingClientRect().width / 2);
    }

    get vertical() {
        return this.y / (this.container.getBoundingClientRect().height / 2);
    }
}

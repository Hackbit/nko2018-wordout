<template>
    <canvas ref="canvas"></canvas>
</template>

<script lang="ts">
    import { Component, Vue} from 'vue-property-decorator';

    const DIMENSIONS = 40;
    const MIN_SPACE = 50 + (DIMENSIONS / 2);
    const SPEED = 9;

    interface ILetter {
        top: number;
        left: number;
        letter: string;
    }

    @Component({
        name: 'ui-background'
    })
    export default class Background extends Vue {
        public letters: ILetter[] = [];
        public isAnimating: boolean = true;

        private lastFrame: number;
        private ctx: CanvasRenderingContext2D;

        randomLetter(): string {
            const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
            return letters[Math.floor(Math.random() * letters.length)].toUpperCase();
        }

        randomPosition(xModifier: number = 0, yModifier: number = 0) {
            const position = { x: 0, y: 0 };
            const HALF_SPACE = MIN_SPACE / 2;
            let tries = 0;

            do {
                const randX = (Math.random() * window.innerWidth - MIN_SPACE) + HALF_SPACE + xModifier;
                const randY = Math.random() * window.innerHeight + yModifier;
                position.x = randX;
                position.y = randY;
                tries++;

                if (!this.letters.some((letter) => {
                    if (randX < (letter.left - MIN_SPACE) || randX > (letter.left + MIN_SPACE)) {
                        return false;
                    }

                    return !(randY < (letter.top - MIN_SPACE) || randY > (letter.top + MIN_SPACE));
                })) {
                    return position;
                }

                if (tries > 10000) {
                    // Bail.
                    console.log('Bailing');
                    return position;
                }
            } while(true);
        }

        update() {
            window.requestAnimationFrame(() => this.update());

            if (!this.isAnimating) {
                return;
            }

            const now = window.performance ? window.performance.now() : Date.now();
            const moveBy = SPEED * ((now - (this.lastFrame || 0)) / 100);

            for (const letter of this.letters) {
                letter.top += moveBy;

                if (letter.top > (window.innerHeight + DIMENSIONS)) {
                    const { x, y } = this.randomPosition(0, -window.innerHeight);
                    letter.left = x;
                    letter.top = y;
                }
            }

            this.lastFrame = now;
            this.draw();
        }

        draw() {
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

            this.ctx.font = '30px Helvetica, Arial, sans-serif';
            this.ctx.fillStyle = '#3476c1';
            for (const letter of this.letters) {
                this.ctx.fillText(letter.letter, Math.round(letter.left), Math.round(letter.top * 100) / 100);
            }
        }

        mounted() {
            const canvas = (this.$refs.canvas as HTMLCanvasElement);
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            this.ctx = canvas.getContext('2d');
            this.ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < 100; i++) {
                const { x, y } = this.randomPosition();
                this.letters.push({
                    letter: this.randomLetter(),
                    top: -y,
                    left: x,
                });
            }

            this.update();
            document.addEventListener('visibilitychange', () => {
                console.log('Lost Focus - ', document.hidden);
                this.isAnimating = !document.hidden;
            })
        }
    }
</script>

<style lang="scss" scoped>
    @import "../css/_variables.scss";

    canvas {
        overflow: hidden;
        background: transparent;
        width: 100vw;
        height: 100vh;
        position: absolute;
        left: 0;
        top: 0;
    }

</style>
<template>
    <div class="container" :style="{
        height: `${ !isBreakable ? `${tileWidth}px` : 'auto' }`
    }">
        <!-- TODO: Sanitize Word -->
        <div ref="container" :class="['word', `word--${word.toLowerCase()}`, { 'breakable': isBreakable }]">
            <div v-for="(letter, index) of letters"
                 class="tile" :key="index" :style="{
                    animationDelay: (index * 100) + 'ms',
                    width: `${tileWidth}px`,
                    height: `${tileWidth}px`,
                    lineHeight: `${tileWidth}px`,
                    fontSize: `${fontSize}px`,
                }">
                {{letter.toUpperCase()}}
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import {Prop, Component, Vue, Watch} from 'vue-property-decorator';

    const MARGIN = 5;
    const MIN = 35;

    @Component({

    })
    export default class Word extends Vue {
        @Prop({
            type: String,
            default: ''
        })
        public word!: string;

        public tileWidth: number = 0;
        public isBreakable: boolean = false;
        public fontSize: number = 0;
        private containerWidth!: number;

        public setWidth() {
            const container = this.$refs.container as Element;
            this.containerWidth = container.getBoundingClientRect().width;
            this.setTileInfo();
        }

        public setTileInfo() {
            const max = (window.innerHeight / 100) * 30;
            this.tileWidth = Math.max(
                Math.min((this.containerWidth / this.word.length) - MARGIN, max),
                MIN
            );

            this.isBreakable = this.tileWidth === MIN;

            this.fontSize = this.tileWidth - 20;
        }

        public onWindowResize = () => {
            this.setWidth();
        }

        public mounted() {
            this.setWidth();
            window.addEventListener('resize', this.onWindowResize);
        }

        public destroyed() {
            window.removeEventListener('resize', this.onWindowResize);
        }

        @Watch('word')
        public onWordChange() {
            this.setTileInfo();
        }

        get letters(): string[] {
            return this.word.split('');
        }

    }
</script>

<style lang="scss">
    @import "../css/_variables.scss";

    @keyframes bounce {
        0% {
            transform: translateY(0%);
        }
        100% {
            transform: translateY(100%);
        }
    }

    .container {
        box-sizing: content-box;
    }

    .word {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-items: center;
        justify-content: center;

        &.breakable {
            flex-wrap: wrap;
        }

        &--wordout {
            height: 200%;

            .tile {
                animation: alternate bounce 1s infinite ease-in-out;
            }
        }

        &--rainbow {
            .tile:nth-child(1) { }
        }
    }

    .tile {
        margin-left: 5px;
        margin-right: 5px;

        padding: 5px;
        background: $secondary;
        border-radius: 10px;
        text-align: center;
        box-shadow: 0px 6px 0px #{darken($secondary, 20%)}, 0px 3px 15px rgba(0,0,0,.4);
        text-shadow: 0px  -1px 0px rgba(0,0,0,.5);
    }

    .breakable .tile {
        margin-top: 10px;
    }
</style>
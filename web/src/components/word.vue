<template>
    <div :class="['word', `word--${word.toLowerCase()}`]">
        <div v-for="(letter, index) of letters" class="tile" :style="{ animationDelay: (index * 100) + 'ms'}">
            {{letter.toUpperCase()}}
        </div>
    </div>
</template>

<script lang="ts">
    import {Prop, Component, Vue} from 'vue-property-decorator';

    @Component({

    })
    export default class Word extends Vue {
        @Prop({
            type: String,
            default: ''
        })
        public word!: string;

        get letters(): string[] {
            return this.word.split('');
        }
    }
</script>

<style lang="scss">
    @import "../css/_variables.scss";

    @keyframes bounce {
        0% {
            transform: translateY(-50%);
        }
        100% {
            transform: translateY(50%);
        }
    }

    .word {
        width: auto;
        display: flex;
        flex-direction: row;
        justify-items: center;
        justify-content: center;

        &--wordout {
            margin-top: 35px;
            margin-bottom: 35px;
            .tile {
                animation: alternate bounce 1s infinite ease-in-out;
            }
        }

        &--rainbow {
            .tile:nth-child(1) { }
        }
    }

    .tile {
        margin-left: 10px;
        margin-right: 10px;

        box-sizing: border-box;
        width: 70px;
        height: 70px;
        padding: 10px;
        font-size: 50px;
        background: $secondary;
        border-radius: 10px;
        text-align: center;
        box-shadow: 0px 6px 0px #{darken($secondary, 20%)}, 0px 3px 15px rgba(0,0,0,.4);
        text-shadow: 0px  -1px 0px rgba(0,0,0,.5);
    }
</style>
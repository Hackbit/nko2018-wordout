<template>
    <div>
        <ul class="words">
            <li
                v-for="(iword, index) in words"
                :key="index"
                :class="{
                    'word': true,
                    'word--valid': iword.isValid,
                    'word--duplicate': iword.isDuplicated,
                    'word--invalid': !iword.isValid,
                }">
                <span>{{iword.word}} ({{ iword.isDuplicated ? 'dupe' : `+${iword.points}` }})</span>
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
    import { Component, Vue, Prop } from 'vue-property-decorator';
    import Word from './word.vue';
    import { IWord } from '@/utils/word.types';

    @Component({
        components: {
            Word,
        }
    })
    export default class WordTicker extends Vue {
        @Prop()
        public words!: IWord[];
    }
</script>

<style lang="scss" scoped>

    @keyframes fadeLeave {
        0% {
            opacity: 1;
        }
        99% {
            opacity: 0
        }
        100% {
            opacity: 0;
            width: 0px;
            height: 0px;
            padding: 0px;
            font-size: 0;
        }
    }

    .words {
        padding: 10px;
        text-align: center;
    }

    .word {
        display: inline-block;
        width: auto;
        padding-right: 5px;
        color: orange;
        font-weight: bold;
        animation: fadeLeave 1s forwards;
        animation-delay: 3s;

        &--valid {
            color: limegreen;
        }

        &--invalid {
            color: #aa0000;
        }

        &--duplicate {
            color: gray;
        }
    }
</style>

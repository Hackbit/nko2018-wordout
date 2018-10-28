<template>
    <div>
        <word ref="word" :word="currentWord" />

        <div class="hidden">
            <input
                autofocus
                autocomplete="off"
                ref="input"
                @blur="$event.target.focus()"
                @keydown="onKeyDown($event)"
                @keydown.enter="onChange()"
                :value="currentWord"
                @input="currentWord = $event.target.value"
            />
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Vue, Emit } from 'vue-property-decorator';
    import Word from './word.vue';

    @Component({
        components: {
            Word,
        }
    })
    export default class WordInput extends Vue {
        public currentWord: string = '';

        public onKeyDown(event: KeyboardEvent) {
            const code: number = event.which || event.keyCode;
            const key: string = String.fromCharCode(code);

            if (code === 13 || code === 8) {
                return;
            }

            if (!(/[a-z\-]/ig.test(key))) {
                event.preventDefault();
                event.stopPropagation();
            }
        }

        @Emit('change')
        public onChange() {
            const word = this.currentWord;
            (this.$refs.input as HTMLInputElement).blur();
            this.currentWord = '';
            (this.$refs.input as HTMLInputElement).focus();
            return word;
        }

        public mounted() {
            (this.$refs.input as HTMLInputElement).focus();
        }
    }
</script>

<style lang="scss" scoped>
    .hidden {
        position: fixed;
        transform: translate(-100%, -100%);
        left: -100%;
        top: -100%;
    }
</style>

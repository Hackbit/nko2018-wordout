<template>
    <input class="input" @input="$emit('input', $event.target.value)" @keydown.enter="send($event.target.value)" @change="$emit('change', $event.target.value)"/>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';

    @Component({
        inheritAttrs: true,
    })
    export default class UiInput extends Vue {
        public send(value: string) {
            this.$emit('change', value);
            this.$emit('send');
        }
    }
</script>

<style lang="scss" scoped>
    @import "../css/_variables.scss";

    .input {
        padding: 15px;
        width: 100%;
        font-size: 24px;
        border-radius: 10px;
        outline: none;
    }
</style>

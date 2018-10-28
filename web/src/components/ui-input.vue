<template>
    <input class="input" @input="$emit('input', $event.target.value)" @change="$emit('change', $event.target.value)"/>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';

    @Component({
        inheritAttrs: true,
    })
    export default class UiInput extends Vue {
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

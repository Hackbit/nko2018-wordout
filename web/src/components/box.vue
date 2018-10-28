<template>
    <div :class="['box', { 'box--transparent': transparent }]">
        <slot></slot>
    </div>
</template>


<script lang="ts">
    import { Component, Vue, Prop } from 'vue-property-decorator';

    @Component({
    })
    export default class Box extends Vue {
        @Prop(Boolean)
        public transparent!: boolean;
    }
</script>

<style lang="scss" scoped>
.box {
    margin-top: 10px;
    position: relative;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-content: center;
    justify-content: flex-end;
    color: white;
    width: calc(100vw - 10px);
    padding: 10px;
    border-radius: 10px;
    max-width: 400px;
    background: rgba(0, 0, 0, 0.3);

    &--transparent {
        background: transparent;
        width: 100vw;
    }
}
</style>

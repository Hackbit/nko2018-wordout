<template>
    <div>
        <router-link v-if="$attrs.to" @click="$emit('click')" :to="$attrs.to" :class="['button', { 'button--disabled': isDisabled }]">
            <slot></slot>
        </router-link>
        <button v-if="!$attrs.to" @click="$emit('click')" :class="['button', { 'button--disabled': isDisabled }]"><slot></slot></button>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';

    @Component({
        inheritAttrs: false,
    })
    export default class UiButton extends Vue {
        @Prop(Boolean)
        public isDisabled!: boolean;
    }
</script>


<style lang="scss" scoped>
    @import "../css/_variables.scss";

    .button {
        text-align: center;
        text-transform: uppercase;
        text-decoration: none;
        width: 100%;
        color: inherit;
        margin-top: 20px;
        margin-bottom: 15px;
        background: $secondary;
        background: radial-gradient(ellipse at center, #{$secondary} 0%,#{darken($secondary, 5%)} 100%);
        font-weight: bold;

        color: darken($secondary, 30%);

        box-shadow: 0px 6px 0px #{darken($secondary, 20%)}, 0px 3px 15px rgba(0,0,0,.4);
        text-shadow: 0px  -1px 0px rgba(0,0,0,.5);

        font-size: 18px;
        border: none;
        outline: none;
        padding: 15px;
        border-radius: 10px;
        display: block;

        &--disabled {
            color: white;
            background: #7e7e7e !important;
            box-shadow: 0px 6px 0px #4e4e4e, 0px 3px 15px rgba(0,0,0,.4) !important;
        }

        &:hover {
            background: darken($secondary, 10%);
        }

        &:active {
            margin-top: 25px;
            padding-bottom: 10px;
            box-shadow: 0px 6px 0px #{darken($secondary, 10%)}, 0px 3px 15px rgba(0,0,0,.4);
        }
    }
</style>

<template>
    <div>
        <router-link v-if="$attrs.to" @click="$emit('click')" :to="$attrs.to" class="button">
            <slot></slot>
        </router-link>
        <button v-if="!$attrs.to" @click="$emit('click')" class="button"><slot></slot></button>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';

    @Component({
        inheritAttrs: false,
    })
    export default class UiButton extends Vue {
    }
</script>


<style lang="scss" scoped>
    @import "../css/_variables.scss";

    .button {
        text-align: center;
        text-decoration: none;
        width: 100%;
        color: inherit;
        margin-top: 20px;
        margin-bottom: 15px;
        background: $secondary;
        font-weight: bold;


        box-shadow: 0px 6px 0px #{darken($secondary, 20%)}, 0px 3px 15px rgba(0,0,0,.4);
        text-shadow: 0px  -1px 0px rgba(0,0,0,.5);

        font-size: 18px;
        border: none;
        outline: none;
        padding: 15px;
        border-radius: 10px;
        display: block;

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

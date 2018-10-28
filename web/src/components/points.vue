<template>
    <div class="points">
        <div class="title">{{ label || 'POINTS' }}</div>
        <div class="amount">{{points}}</div>
    </div>
</template>


<script lang="ts">
    import { Component, Vue, Prop } from 'vue-property-decorator';

    @Component({
    })
    export default class Points extends Vue {
        @Prop(Number)
        private points!: number;

        @Prop(String)
        private label!: string;
    }
</script>

<style lang="scss" scoped>
.points {
    border: 1px solid white;

}
.title {
    background: white;
    color: black;
    font-weight: bold;
    padding: 5px;
    text-align: center;
}
.amount {
    padding: 5px;
    color: white;
    text-align: center;
}
</style>

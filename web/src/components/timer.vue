<template>
     <div class="timer">
        <div class="title">TIME</div>
        <div class="amount">{{timeLeft}}</div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class Timer extends Vue {
    public timeLeft: number = 0;
    public started: number = 0;

    @Prop(Number)
    public time!: number;


    public updateTimer() {
        if (this.timeLeft !== 0) {
            setTimeout(() => {
                this.updateTimer();
            }, 1000);
        }

        this.timeLeft = Math.max(this.time - Math.round((Date.now() - this.started) / 1000), 0);
    }

    public mounted() {
        this.start();
    }

    public start() {
        this.timeLeft = this.time;
        this.started = Date.now();
        this.updateTimer();
    }
}
</script>


<style lang="scss" scoped>
.timer {
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

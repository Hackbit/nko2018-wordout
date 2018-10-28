<template>
    <div>
        <slot :timeLeft="timeLeft">
            <div class="timer">
                <div class="title">TIME</div>
                <div class="amount">{{formattedTime}}</div>
            </div>
        </slot>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

@Component
export default class Timer extends Vue {
    public timeLeft: number = 0;
    public started: number = 0;

    @Prop(Number)
    public time!: number;

    get formattedTime(): string {
        if (this.timeLeft < 60) {
            return `${this.timeLeft}s`;
        }

        let tempTime = this.timeLeft;

        const hours = Math.floor(tempTime / 3600);
        tempTime = tempTime % 3600;

        const minutes = Math.floor(tempTime / 60);
        tempTime = tempTime % 60;

        return `${hours ? `${hours}h `: ''}${minutes||0}m ${tempTime||0}s`;
    }


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
    width: 100%;
    height: 100%;
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

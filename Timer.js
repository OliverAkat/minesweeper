export  class Timer {
	constructor() {
		this.resetTimer()
	}

	getCurrentTime() {
		return new Date().getTime()
	}
	resetTimer() {
		this.startTime = this.getCurrentTime();
		this.endTime = this.getCurrentTime();
		this.paused = false;
	}

    setStartTime() {
        this.startTime = new Date().getTime();
    }

	getElapsedTime() {
		if (!this.paused) this.endTime = this.getCurrentTime();

		return parseInt((this.endTime - this.startTime)/1000);
	}

	pauseTimer() {
		this.paused = true;
	}

	getPrintedTime() {
		const time = this.getElapsedTime();
        console.log(time);
		return [parseInt(time/60), time%60];
	}

	renderTime() {
		const timer = document.getElementById('timer')
        const [timerMin, timerSec] = this.getPrintedTime()
		timer.innerHTML = `${('' + timerMin).padStart(2, '0')}:${('' + timerSec).padStart(2, '0')}`
	}
}
/**
 * @file scheduler
 * @author atom-yang
 * @date 2019-08-08
 */
const defaultOptions = {
  interval: 4000, // ms
  callback: () => {}
};

class Scheduler {
  constructor(options = defaultOptions) {
    this.config = {
      ...defaultOptions,
      ...options
    };
    this.timerRef = null;
    this.paused = false;
    this.loopTimes = 0;
    this.isEnd = false;
  }

  setInterval(interval) {
    this.config.interval = interval;
  }

  setCallback(callback) {
    this.config.callback = callback;
  }

  setTimer(interval) {
    this.timerRef = setTimeout(async () => {
      if (this.isEnd) {
        return;
      }
      this.runnerTimeStart = new Date().getTime();
      if (!this.paused) {
        await this.config.callback(++this.loopTimes);
      }
      const runnerTimeUsed = new Date().getTime() - this.runnerTimeStart;
      let intervalLeft = this.config.interval - runnerTimeUsed;
      intervalLeft = intervalLeft < 0 ? 0 : intervalLeft;
      this.setTimer(intervalLeft);
    }, interval);
  }

  startTimer() {
    this.paused = false;
    if (this.timerRef) {
      return;
    }
    this.setTimer(this.config.interval);
  }

  restartTimer(option = {}) {
    const config = {
      ...this.config,
      ...option
    };
    this.endTimer();
    this.config = config;
    this.startTimer();
  }

  pauseTimer() {
    if (this.timerRef) {
      this.paused = true;
    }
  }

  endTimer() {
    this.isEnd = true;
    if (this.timerRef) {
      clearTimeout(this.timerRef);
      this.timerRef = null;
    }
  }
}

module.exports = Scheduler;

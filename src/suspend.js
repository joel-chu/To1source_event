// making all the functionality on it's own
// import { WatchClass } from './watch'

export default class SuspendClass {

  constructor() {
    // suspend, release and queue
    this.__suspend__ = null;
    this.queueStore = new Set()
    /*
    this.watch('suspend', function(value, prop, oldValue) {
      this.logger(`${prop} set from ${oldValue} to ${value}`)
      // it means it set the suspend = true then release it
      if (oldValue === true && value === false) {
        // we want this happen after the return happens
        setTimeout(() => {
          this.release()
        }, 1)
      }
      return value; // we need to return the value to store it
    })
    */
  }

  /**
   * setter to set the suspend and check if it's boolean value
   * @param {boolean} value to trigger
   */
  set $suspend(value) {
    if (typeof value === 'boolean') {
      const lastValue = this.__suspend__;
      this.__suspend__ = value;
      this.logger('($suspend)', `${lastValue} change to ${value}`)
      if (lastValue === true && value === false) {
        setTimeout(() => {
          this.release()
        }, 1)
      }
    } else {
      throw new Error(`$suspend only accept Boolean value!`)
    }
  }

  /**
   * queuing call up when it's in suspend mode
   * @param {any} value
   * @return {Boolean} true when added or false when it's not
   */
  $queue(...args) {
    if (this.__suspend__ === true) {
      this.logger('($queue)', 'added to $queue', args)
      // there shouldn't be any duplicate ...
      this.queueStore.add(args)
    }
    return this.__suspend__;
  }

  /**
   * a getter to get all the store queue
   * @return {array} Set turn into Array before return
   */
  get $queues() {
    let size = this.queueStore.size;
    this.logger('($queues)', `$queues size: ${size}`)
    if (size > 0) {
      return Array.from(this.queueStore)
    }
    return []
  }

  /**
   * Release the queue
   * @return {int} size if any
   */
  release() {
    let size = this.queueStore.size
    this.logger('(release)', `Release was called ${size}`)
    if (size > 0) {
      const queue = Array.from(this.queueStore)
      this.queueStore.clear()
      this.logger('queue', queue)
      queue.forEach(args => {
        this.logger(args)
        Reflect.apply(this.$trigger, this, args)
      })
      this.logger(`Release size ${this.queueStore.size}`)
    }
  }
}

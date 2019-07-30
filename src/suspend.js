// making all the functionality on it's own
import { WatchClass } from './watch'

export default class SuspendClass extends WatchClass {

  constructor() {
    super()
    // suspend, release and queue
    this.suspend = null;
    this.queueStore = new Set()
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
  }

  /**
   * setter to set the suspend and check if it's boolean value
   * @param {boolean} value to trigger
   */
  set $suspend(value) {
    if (typeof value === 'boolean') {
      this.suspend = value;
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
    if (this.suspend === true) {
      // there shouldn't be any duplicate ...
      this.queueStore.add(args)
    }
    return this.suspend;
  }

  /**
   * a getter to get all the store queue
   * @return {array} Set turn into Array before return
   */
  get $queues() {
    let size = this.queueStore.size
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
    this.logger(`Release was called ${size}`)
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

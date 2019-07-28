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
        this.release()
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
   * 
   */
  set $queue(value) {

  }

  /**
   *
   *
   */
  release() {
    this.logger('release was called')

    this.$done = 'release called'
  }
}

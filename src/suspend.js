// making all the functionality on it's own
// import { WatchClass } from './watch'
/*
we use a different way to do the same watch thing now
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
import { getRegex, isRegExp } from './utils'
import BaseClass from './base'

export default class SuspendClass extends BaseClass {

  constructor() {
    super()

    // suspend, release and queue
    this.__suspend_state__ = null
    // to do this proper we don't use a new prop to hold the event name pattern
    this.__pattern__ = null

    
    this.queueStore = new Set()
  }

  /**
   * start suspend
   * @return {void}
   */
  $suspend() {
    this.logger(`---> SUSPEND ALL OPS <---`)
    this.__suspend__(true)
  }

  /**
   * release the queue
   * @return {void}
   */
  $release() {
    this.logger(`---> RELEASE SUSPENDED QUEUE <---`)
    this.__suspend__(false)
  }

  /**
   * suspend event by pattern
   * @param {string} pattern the pattern search matches the event name
   * @return {void}
   */
  $suspendEvent(pattern) {
    const regex = getRegex(pattern)
    if (isRegExp(regex)) {
      this.__pattern__ = regex
      return this.$suspend()
    }
    throw new Error(`We expect a pattern variable to be string or RegExp, but we got "${typeof regex}" instead`)
  }

  /**
   * queuing call up when it's in suspend mode
   * @param {string} evt the event name
   * @param {*} args unknown number of arguments
   * @return {boolean} true when added or false when it's not
   */
  $queue(evt, ...args) {
    this.logger('($queue) get called')
    if (this.__suspend_state__ === true) {
      if (isRegExp(this.__pattern__)) { // it's better then check if its not null
        // check the pattern and decide if we want to suspend it or not
        let found = this.__pattern__.test(evt)
        if (!found) {
          return false
        }
      }
      this.logger('($queue) added to $queue', args)
      // @TODO there shouldn't be any duplicate, but how to make sure?
      this.queueStore.add([evt].concat(args))
      // return this.queueStore.size
    }
    return !!this.__suspend_state__
  }

  /**
   * a getter to get all the store queue
   * @return {array} Set turn into Array before return
   */
  get $queues() {
    let size = this.queueStore.size
    this.logger('($queues)', `size: ${size}`)
    if (size > 0) {
      return Array.from(this.queueStore)
    }
    return []
  }

  /**
   * to set the suspend and check if it's boolean value
   * @param {boolean} value to trigger
   */
  __suspend__(value) {
    if (typeof value === 'boolean') {
      const lastValue = this.__suspend_state__
      this.__suspend_state__ = value
      this.logger(`($suspend) Change from "${lastValue}" --> "${value}"`)
      if (lastValue === true && value === false) {
        this.__release__()
      }
    } else {
      throw new Error(`$suspend only accept Boolean value! we got ${typeof value}`)
    }
  }

  /**
   * Release the queue
   * @return {int} size if any
   */
  __release__() {
    let size = this.queueStore.size
    let pattern = this.__pattern__
    this.__pattern__ = null
    this.logger(`(release) was called with ${size}${pattern ? ' for "' + pattern + '"': ''} item${size > 1 ? 's' : ''}`)
    if (size > 0) {
      const queue = Array.from(this.queueStore)
      this.queueStore.clear()
      this.logger('(release queue)', queue)
      queue.forEach(args => {
        this.logger(args)
        Reflect.apply(this.$trigger, this, args)
      })
      this.logger(`Release size ${this.queueStore.size}`)
    }

    return size
  }
}

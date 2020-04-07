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
    // @1.2.2 this become an array so we can hold different events
    this.__pattern__ = []
    // key value pair store to store the queued calls
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
    this.logger(`---> RELEASE ALL SUSPENDED QUEUE <---`)
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
      // check if it's already added 
      if (this.isPatternRegisterd(regex) === false) {
        this.__pattern__.push(regex)
        return this.$suspend()
      }
      return false
    }
    throw new Error(`We expect a pattern variable to be string or RegExp, but we got "${typeof regex}" instead`)
  }

  /**
   * This is pair with $suspnedEvent to release part of the event queue by the pattern (eventName)
   * @param {*} pattern a eventName of partial eventName to create a RegExp
   * @return {*} should be the number of queue got released
   */
  $releaseEvent(pattern) {
    const regex = getRegex(pattern)
    if (isRegExp(regex) && this.isPatternRegisterd(pattern)) {

      const self = this
      // first get the list of events in the queue store that match this pattern
      const ctn = this.$queues
        // first index is the eventName
        .filter(content => regex.test(content[0]))
        .map(content => {
          this.logger(`[release] execute ${content[0]} matches ${regex}`, content)
          // we just remove it
          self.queueStore.delete(content)
          // execute it
          Reflect.apply(self.$trigger, self, content)
        })
        .length // so the result will be the number of queue that get exeucted
      // we need to remove this event from the pattern queue array 
      this.__pattern__ = this.__pattern__.filter(p => p !== regex)

      return ctn
    }
    throw new Error(`We expect a pattern variable to be string or RegExp, but we got "${typeof regex}" instead`)
  }

  /**
   * queuing call up when it's in suspend mode,
   * it's currently suspending then add to store then the $trigger will do nothing
   * @param {string} evt the event name
   * @param {*} args unknown number of arguments
   * @return {boolean} true when added or false when it's not
   */
  $queue(evt, ...args) {
    this.logger('($queue) get called')
    
    const hasPattern = this.__pattern__.length
    // 1. whole sale suspend all
    switch (true) {
      case this.__suspend_state__ === true && !hasPattern:
        
        return this.addToQueueStore(evt, args)
      case hasPattern: 
        // check the pattern and decide if we want to suspend it or not
        let found = !!this.__pattern__.filter(p => p.test(evt)).length
        if (!found) {
          this.logger(`($queue) ${evt} NOT added to $queueStore`, args)
          // just exit and not add to the queue
          return false
        }
        
        return this.addToQueueStore(evt, args)
      default:
        return false
    } 
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
   * Wrapper method with a logger 
   * @param {*} evt 
   * @param {*} args 
   * @return {boolean}
   */
  addToQueueStore(evt, args) {
    this.logger(`($queue) ${evt} added to $queueStore`, args)
    this.queueStore.add([evt].concat(args))

    return true
  }

  /**
   * check if certain pattern already registered in the queue
   * @param {*} pattern
   * @return {boolean} 
   */
  isPatternRegisterd(pattern) {
    return !!this.__pattern__.filter(p => p === pattern).length
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
   * Release the queue, this is a wholesale release ALL
   * @return {int} size if any
   */
  __release__() {
    let size = this.queueStore.size
    let pattern = this.__pattern__
    this.__pattern__ = []
    
    this.logger(`(release) was called with ${size}${pattern.length ? ' for "' + pattern.join(',') + '"': ''} item${size > 1 ? 's' : ''}`)
    
    if (size > 0) {
      const queue = Array.from(this.queueStore)
      this.logger('(release queue)', queue)

      queue.forEach(args => {
        this.logger(`[release] execute ${args[0]}`, args)

        Reflect.apply(this.$trigger, this, args)
      })

      this.queueStore.clear()
      this.logger(`Release size ${this.queueStore.size}`)
    }

    return size
  }
}

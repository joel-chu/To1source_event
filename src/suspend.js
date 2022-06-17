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
// main 
export default class SuspendClass extends BaseClass {

  constructor(config) {
    super(config)
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
   * @param {array.<string>} patterns the pattern search matches the event name
   * @return {array} if the pattern return is registered or not
   */
  $suspendEvent(...patterns) {
    return patterns.map(pattern => {
      const regex = getRegex(pattern)
      if (isRegExp(regex)) {
        // check if it's already added 
        if (this.__isPatternRegisterd(regex) === false) {
          this.__pattern__.push(regex)

          return this.__pattern__.length
        }
        return false
      }
      throw new Error(`We expect a pattern variable to be string or RegExp, but we got "${typeof regex}" instead`)
    })
  }

  /**
   * This is pair with $suspnedEvent to release part of the event queue by the pattern (eventName)
   * @param {array.<*>} patterns a eventName of partial eventName to create a RegExp
   * @return {number} should be the number of queue got released
   */
  $releaseEvent(...patterns) {
    return patterns.map(pattern => {
      this.logger(`($releaseEvent)`, pattern)
      const regex = getRegex(pattern)
      if (isRegExp(regex) && this.__isPatternRegisterd(regex)) {
        const self = this

        return this.__getToReleaseQueue(regex)
          .map((args, i) => {
            
            Reflect.apply(self.$trigger, self, args)

            return i 
          }).reduce((a, b) => ++b, 0)
      }

      this.logger('$releaseEvent throw error ==========================>', this.__pattern__, regex)
      throw new Error(`We expect a pattern variable to be string or RegExp, but we got "${typeof regex}" instead`)
    })
    .reduce((x, y) => x + y, 0)
  }

  /**
   * queuing call up when it's in suspend mode,
   * it's currently suspending then add to store then the $trigger will do nothing
   * @param {string} evt the event name
   * @param {*} args unknown number of arguments
   * @return {boolean} true when added or false when it's not
   */
  $queue(evt, ...args) {
    switch (true) {
      case this.__suspend_state__ === true: // this will take priority over the pattern
        
        return this.__addToQueueStore(evt, args)
      case !!this.__pattern__.length === true: 
        // check the pattern and decide if we want to suspend it or not
        if (!!this.__pattern__.filter(p => p.test(evt)).length) {
          
          return this.__addToQueueStore(evt, args)
        }
        this.logger(`($queue) ${evt} NOT added to $queueStore`, this.__pattern__)
          
        return false 
      default:
        this.logger('($queue) get called NOTHING added')
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
   * The reason is before we call $trigger we need to remove the pattern from queue
   * otherwise, it will never get release
   * @param {*} pattern to find the queue 
   * @return {array} queue to get execute 
   */
  __getToReleaseQueue(regex) {
    // first get the list of events in the queue store that match this pattern
    const list = this.$queues
      // first index is the eventName
      .filter(content => regex.test(content[0]))
      .map(content => {
        this.logger(`[release] execute ${content[0]} matches ${regex}`, content)
            // we just remove it
        this.queueStore.delete(content)
        
        return content
      })
    if (list.length > 0) {
      // we need to remove this event from the pattern queue array 
      this.__pattern__ = this.__pattern__.filter(p => p.toString() !== regex.toString()) 
    }

    return list 
  }

  /**
   * Wrapper method with a logger 
   * @param {*} evt 
   * @param {*} args 
   * @return {boolean}
   */
  __addToQueueStore(evt, args) {
    this.logger(`($queue) ${evt} added to $queueStore`, args)

    // @TODO should we check if this already added? 
    // what if that is a multiple call like $on
    this.queueStore.add([evt].concat(args))

    return true
  }

  /**
   * check if certain pattern already registered in the queue
   * @param {*} pattern
   * @return {boolean} 
   */
  __isPatternRegisterd(pattern) {
    // this is a bit of a hack to compare two regex Object  
    return !!this.__pattern__.filter(p => (
      p.toString() === pattern.toString()
    )).length 
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

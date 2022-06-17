// setup a base class to put all the don't know where to put methods 
import { hashCode2Str, isString } from './utils'
import { AVAILABLE_TYPES } from './constants'
// main 
export default class BaseClass {

  constructor() {}

  /**
   * logger function for overwrite
   */
  logger() {}

  // for id if the instance is this class
  get $name() {
    return 'to1source-event'
  }

  /**
   * validate the event name(s)
   * @param {string[]} evt event name
   * @return {boolean} true when OK
   */
  validateEvt(...evt) {
    evt.forEach(e => {
      if (!isString(e)) {
        this.logger('(validateEvt)', e)

        throw new Error(`Event name must be string type! we got ${typeof e}`)
      }
    })

    return true
  }

  /**
   * Simple quick check on the two main parameters
   * @param {string} evt event name
   * @param {function} callback function to call
   * @return {boolean} true when OK
   */
  validate(evt, callback) {
    if (this.validateEvt(evt)) {
      if (typeof callback === 'function') {

        return true
      }
    }
    throw new Error(`callback required to be function type! we got ${typeof callback}`)
  }

  /**
   * Check if this type is correct or not added in V1.5.0
   * @param {string} type for checking
   * @return {boolean} true on OK
   */
  validateType(type) {
    this.validateEvt(type)
    
    return !!AVAILABLE_TYPES.filter(t => type === t).length
  }

  /**
   * Run the callback
   * @param {function} callback function to execute
   * @param {array} payload for callback
   * @param {object} ctx context or null
   * @return {void} the result store in $done
   */
  run(callback, payload, ctx) {
    this.logger('(run) callback:', callback, 'payload:', payload, 'context:', ctx)
    this.$done = Reflect.apply(callback, ctx, this.toArray(payload))

    return this.$done // return it here first 
  }

  /**
   * generate a hashKey to identify the function call
   * The build-in store some how could store the same values!
   * @param {function} fn the converted to string function
   * @return {string} hashKey
   */
  hashFnToKey(fn) {
    return hashCode2Str(fn.toString())
  }
} 
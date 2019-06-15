// this is the new implementation without the hash key
// only using Map and Set instead
import {
  NB_EVENT_SERVICE_PRIVATE_STORE,
  NB_EVENT_SERVICE_PRIVATE_LAZY
} from './store'

export default class EventService {

  /**
   * class constructor
   */
  constructor(config = {}) {
    if (config.logger && typeof config.logger === 'function') {
      this.logger = config.logger;
    }
  }

  /**
   * logger for overwrite
   */
  logger() {}

  //////////////////////////
  //    PUBLIC METHODS    //
  //////////////////////////

  /**
   * Register your evt handler, note we don't check the type here,
   * we expect you to be sensible and know what you are doing.
   * @param {string} evt name of event
   * @param {function} callback bind method
   * @param {object} context to execute this call in
   * @return {boolean} result add or not
   */
  $on(evt , callback , context) {

  }

  /**
   * once only registered it once, there is no overwrite option here
   * @param {string} evt name
   * @param {function} callback to execute
   * @return {boolean} result
   */
  $once(evt , callback , context) {

  }

  /**
   * trigger the event
   * @param {string} evts name
   * @param {mixed} params pass to fn
   * @param {object} context overwrite what stored
   * @return {boolean} found or not
   */
  $trigger(evts , params , context) {

  }

  // this is an alias to the $trigger
  $call(...args) {
    return Reflect.apply(this.$trigger, this, args)
  }

  /**
   * remove the evt from normal store
   * @param {string} evt name
   * @return {boolean} result
   */
  $off(evt) {

  }

  /////////////////////////////
  //    PRIVATE METHODS      //
  /////////////////////////////

  

}

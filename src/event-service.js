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
    // for the $done setter
    this.result = null;
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
   * @param {function} callback bind method --> if it's array or not
   * @param {object} [context=null] to execute this call in
   * @return {number} the size of the store
   */
  $on(evt , callback , context = null) {
    const type = 'on';
    const { validate, takeFromStore, addToNormalStore, logger } = this;
    validate(evt, callback)
    // first need to check if this evt is in lazy store
    let lazyStoreContent = takeFromStore(evt)
    // this is normal register first then call later
    if (lazyStoreContent === false) {
      logger('$on', `${evt} callback is not in lazy store`)
      return addToNormalStore(evt, type, callback, context)
    }
    logger('$on', `${evt} found in lazy store`)
    // this is when they call $trigger before register this callback
    let size = 0;
    lazyStoreContent.forEach(content => {
      let [ payload, ctx ] = content;
      this.run(callback, payload, context || ctx)
      size += addToNormalStore(evt, type, callback, context || ctx)
    })
    return size;
  }

  /**
   * once only registered it once, there is no overwrite option here
   * @param {string} evt name
   * @param {function} callback to execute
   * @return {boolean} result
   */
  $once(evt , callback , context) {
    validate(evt, callback)
    let lazyStoreContent = this.takeFromStore(evt)
    // this is normal register before call $trigger
    if (lazyStoreContent === false) {
      // check to see if this already exist in the normal store
      let nStore = this.normalStore;
      if (!nStore.has(evt)) {
        return this.addToNormalStore(evt, 'once', callback, context)
      }
    }
    // now this is the tricky bit
    // there is a potential bug here that cause by the developer
    // if they call $trigger first, the lazy won't know it's a once call
    // so if in the middle they regiseter any call with the same evt name
    // then this $once call will be fucked - add this to the documentation
    const [ payload, ctx ] = lazyStoreContent;
    this.run(callback, payload, context || ctx)
  }

  /**
   * trigger the event
   * @param {string} evt name NOT allow array anymore!
   * @param {mixed} [payload = []] pass to fn
   * @param {object} [context = null] overwrite what stored
   * @return {number} if it has been execute how many times
   */
  $trigger(evt , payload = [] , context = null) {
    this.validateEvt(evt)
    let found = 0;
    // first check the normal store
    let nStore = this.normalStore;
    if (nStore.has(evt)) {
      let nSet = nStore.get(evt)
      // now loop it over
      nSet.forEach( s => {
        ++found;
        const [ callback, ctx, type ] = s;
        this.run(callback, payload, context || ctx)
        if (type === 'once') {
          nStore.delete(evt)
          return found;
        }
      })
      return found;
    }
    // now this is not register yet
    this.addToLazyStore(evt, payload, context)
    return found;
  }

  // this is an alias to the $trigger
  $call(...args) {
    return Reflect.apply(this.$trigger, this, args)
  }

  /**
   * remove the evt from normal store
   * @param {string} evt name
   * @return {boolean} true actually delete something
   */
  $off(evt) {
    this.validateEvt(evt)
    let stores = [ this.lazyStore, this.normalStore ];
    let found = false;
    stores.forEach(store => {
      if (store.has(evt)) {
        found = true;
        store.delete(evt)
      }
    })
    return found;
  }

  /**
   * return all the listener from the event
   * @param {string} evtName event name
   * @return {array|boolean} listerner(s) or false when not found
   */
  $get(evt) {
    this.validateEvt(evt)
    let fns = [];
    let store = this.normalStore;
    if (store.has(evt)) {
      let list = store.get(evt)
      list.forEach( l => {
        let [callback] = l;
        fns.push(callback)
      })
      return fns;
    }
    return false;
  }

  /**
   * store the return result from the run
   * @param {*} value whatever return from callback
   */
  set $done(value) {
    this.result = value;
  }

  /**
   * getter for $done
   * @return {*} whatever last store result
   */
  get $done() {
    return this.result;
  }

  /////////////////////////////
  //    PRIVATE METHODS      //
  /////////////////////////////

  /**
   * validate the event name
   * @param {string} evt event name
   * @return {boolean} true when OK
   */
  validateEvt(evt) {
    if (typeof evt === 'string') {
      return true;
    }
    throw new Error(`event name must be string type!`)
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
        return true;
      }
    }
    throw new Error(`callback required to be function type!`)
  }

  /**
   * Run the callback
   * @param {function} callback function to execute
   * @param {array} payload for callback
   * @param {object} ctx context or null
   * @return {void} the result store in $done
   */
  run(callback, payload, ctx) {
    this.$done = Reflect.apply(callback, ctx, payload)
  }

  /**
   * Take the content out and remove it from store id by the name
   * @param {string} evt event name
   * @param {string} [storeName = lazyStore] name of store
   * @return {object|boolean} content or false on not found
   */
  takeFromStore(evt, storeName = 'lazyStore') {
    let lazyStore = this[storeName]
    if (lazyStore.has(evt)) {
      let content = lazyStore.get(evt)
      lazyStore.delete(evt)
      return content;
    }
    return false;
  }

  /**
   * The add to store step is similar so make it generic for resuse
   * @param {object} store which store to use
   * @param {string} evt event name
   * @param {spread} args because the lazy store and normal store store different things
   * @return {array} store and the size of the store
   */
  addToStore(store, evt, ...args) {
    let fnSet;
    if (store.has(evt)) {
      fnSet = store.get(evt)
    } else {
      // this is new
      let fnSet = new Set()
    }
    fnSet.add(args)
    store.set(evt, fnSet)
    return [store, fnSet.size]
  }

  /**
   * wrapper to re-use the addToStore
   * @param {string} evt event name
   * @param {string} type on or once
   * @param {function} callback function
   * @param {object} context the context the function execute in or null
   * @return {number} size of the store
   */
  addToNormalStore(evt, type, callback, context) {
    let store = this.normalStore;
    let [_store, size] = this.addToStore(store, evt, callback, context, type)
    this.normalStore = _store;
    return size;
  }

  /**
   * Add to lazy store this get calls when the callback is not register yet
   * so we only get a payload object or even nothing
   * @param {string} evt event name
   * @param {array} payload of arguments or empty if there is none
   * @param {object} context the context the callback execute in
   * @return {number} size of the store
   */
  addToLazyStore(evt, payload = [], context = null) {
    let lstore = this.lazyStore;
    let [_store, size] = this.addToStore(lstore, evt, this.toArray(payload), context)
    this.lazyStore = _store;
    return size;
  }

  toArray(arg) {
    return Array.isArray(arg) ? arg : [arg];
  }

  set normalStore(obj) {
    NB_EVENT_SERVICE_PRIVATE_STORE.set(this, obj)
  }

  get normalStore() {
    return NB_EVENT_SERVICE_PRIVATE_STORE.get(this)
  }

  set lazyStore(obj) {
    NB_EVENT_SERVICE_PRIVATE_LAZY.set(this , obj)
  }

  get lazyStore() {
    return NB_EVENT_SERVICE_PRIVATE_LAZY.get(this)
  }

}

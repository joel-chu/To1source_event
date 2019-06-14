'use strict';
/**
 * nb-event-service ES6 version rewrite
 * This version will be using the hash key to track the callback to avoid
 * the multiple calling the same function over and over again.
 */
import genHaskKey from './hash-code.js'
import {
  NB_EVENT_SERVICE_PRIVATE_STORE,
  NB_EVENT_SERVICE_PRIVATE_LAZY
} from './store'

// Default
export default class NBEventService {
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
    const [hashKey , store] = this.prepareListener(evt , callback)
    // should look at the lazyStore first !!!!
    if (this.executeFnInLazyStore(evt , callback , context , hashKey) === false) {
      // start with normal empty
      if (!store || !store[evt]) {
        const payload = [this.saveToNormalStore(hashKey , callback , context)]
        this.normalStore = this.mergeToStore(store , evt , payload)
        this.logger('init store' , evt , payload)
        return true;
      }
      else if (!this.findInStore(store[evt] , hashKey)) {  // already existed
        // if this hashKey is not registered
        store[evt].push(this.saveToNormalStore(hashKey , callback , context))
        this.normalStore = store;
        this.logger('append another to store')
        return true;
      }
    }
    return false;
  }

  /**
   * once only registered it once, there is no overwrite option here
   * @param {string} evt name
   * @param {function} callback to execute
   * @return {boolean} result
   */
  $once(evt , callback , context) {
    const [hashKey , store] = this.prepareListener(evt , callback);
    // again this could create a problem if this already register in lazy store
    // then someone else try to register with a normal on
    if (this.executeFnInLazyStore(evt , callback , context , hashKey) === false) {
      // if it's already registered, we skip it.
      if (!store[evt]) {
        const normalStore = this.normalStore;
        // @TODO this might create problem later on
        const obj = [this.saveToNormalStore(hashKey , callback , context)]
        this.normalStore = this.mergeToStore(normalStore , evt , obj)
        return true;
      }
    }
    return false;
  }

  /**
   * trigger the event
   * @param {string} evts name
   * @param {mixed} params pass to fn
   * @param {object} context overwrite what stored
   * @return {boolean} found or not
   */
  $trigger(evts , params , context) {
    const store = this.normalStore;
    evts = Array.isArray(evts) ? evts : [evts];
    evts.forEach( (evt) => {
      if (!store[evt]) { // not registered in normal store
        this.logger('not registered put this in lazy store' , evt);
        // TODO this is a bit confusing here
        let lazyStore = this.lazyStore;
        let args = Array.isArray(params) ? params : [params]
        if (lazyStore[evt]) {
          lazyStore[evt].push(args)
        }
        else {
          lazyStore[evt] = [args]
        }
        this.lazyStore = lazyStore;
        return false;
      }
      else {
        store[evt].forEach( (config) => {
          let args = Array.isArray(params) ? params : [params];
          const [hashKey , _config] = config;
          Reflect.apply(_config.fn, (context || _config.context), args)
        })
      }
    })
  }

  /**
   * remove the evt from normal store
   * @param {string} evt name
   * @return {boolean} result
   */
  $off(evt) {
    const store = this.normalStore;
    if (store[evt]) {
      if (Reflect.deleteProperty(store , evt)) {
        this.normalStore = store;
        return true;
      }
    }
    return false;
  }

  /**
   * @return {object} store just return it
   */
  get $store() {
    return this.normalStore;
  }

  /**
   * return all the listener from the event
   * @param {string} evtName event name
   * @return {array} listerner(s)
   */
  $get(evtName) {
    let base = this.normalStore[evtName] || []
    let lazy = this.lazyStore[evtName] || []
    return base.concat(lazy)
  }

  /**
   * This will be search the lazy store if found store in the normal store
   * then convert the lazy store to the normal one here, and immediate execute
   * the action
   * @param {string} evt name
   * @param {function} callback function
   * @param {object} context to excute in
   * @param {string} hashKey of the function
   * @return {mixed} whathappened
   */
  executeFnInLazyStore(evt , callback , context , hashKey) {
    const lazyStore = this.lazyStore;
    if (lazyStore[evt]) { // only when this been registered in lazy store
      lazyStore[evt].forEach( function(params) {
        callback.apply(context , params)
      })
      // convert the lazy store to normal store
      const normalStore = this.normalStore;
      const obj = [this.saveToNormalStore(hashKey , callback , context)]
      this.normalStore = this.mergeToStore(normalStore , evt , obj)
      // remove from the lazy store
      if (Reflect.deleteProperty(lazyStore , evt)) {
        this.lazyStore = lazyStore;
      }
      return true;
    }
    return false; // just null because nothing happen
  }
  /**
   * our own merge method
   * @param {object} store the store to merge
   * @param {string} key to add
   * @param {mixed} value to add
   * @return {object} store the newly defined store
   */
  mergeToStore(store , key , value) {
    store[key] = value;
    this.logger('check key value' , key , value)
    return store;
  }
  /**
   * shorthand to save to store store
   * @param {object} obj to store
   * @return {undefined} none
   */
  set normalStore(obj) {
    NB_EVENT_SERVICE_PRIVATE_STORE.set(this, obj)
  }

  /**
   * @return {object} store store
   */
  get normalStore() {
    return NB_EVENT_SERVICE_PRIVATE_STORE.get(this) || {};
  }

  /**
   * @param {object} obj to store
   * @return {undefined} none
   */
  set lazyStore(obj) {
    NB_EVENT_SERVICE_PRIVATE_LAZY.set(this , obj)
  }

  /**
   * @return {object} store
   */
  get lazyStore() {
    return NB_EVENT_SERVICE_PRIVATE_LAZY.get(this) || {};
  }

  /**
   * @param {string} evt name
   * @param {function} callback to store
   * @param {string} key type of store
   * @return {turple} result hashKey , store
   */
  prepareListener(evt , callback , key = 'store') {
    if (typeof evt !== 'string') {
      throw new Error('Expect event to be string')
    }
    const fn = key === 'store' ? 'normalStore' : 'lazyStore';
    // create a hash code and check if this already been stored
    const store = this[fn]
    const hashKey = this.hashFnToKey(callback)
    return [hashKey , store]
  }

  /**
   * @param {string} key hash
   * @param {function} callback to store
   * @param {object} context to exeucte it
   * @return {object} result
   */
  saveToNormalStore(key , callback , context = null) {
    return [key , {
      fn: callback ,
      context: context
    }]
  }

  /**
   * @param {object} store the event store
   * @param {string} key hash
   */
  findInStore(store , key) {
    return !!store.filter( s => {
      const [hash,] = s;
      return hash === key;
    }).length;
  }

  /**
   * generate a hashKey to identify the function call
   * @param {function} fn the converted to string function
   * @return {string} hashKey
   */
  hashFnToKey(fn) {
    return genHaskKey(fn.toString())
  }
}

// -- EOF --

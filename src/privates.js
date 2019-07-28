// break up the main file because its getting way too long
import {
  NB_EVENT_SERVICE_PRIVATE_STORE,
  NB_EVENT_SERVICE_PRIVATE_LAZY
} from './store'
import genHaskKey from './hash-code'
import { WatchClass } from './watch'

export default class NbEventServiceBase extends WatchClass {

  constructor(config) {
    super()
    if (config.logger && typeof config.logger === 'function') {
      this.logger = config.logger;
    }
    this.keep = config.keep;

    // for the $done setter
    this.result = config.keep ? [] : null;
    // we need to init the store first otherwise it could be a lot of checking later
    this.normalStore = new Map()
    this.lazyStore = new Map()
    // suspend, release and queue
    this.suspend = null;
    this.queue = new Set()
    this.watch('suspend', function(value, prop, oldValue) {
      // it means it set the suspend = true then release it
      if (oldValue === true && value === false) {
        this.release()
      }
    })
  }

  /**
   *
   *
   */
  release() {
    this.logger('release was called')
  }


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
   * Check if this type is correct or not added in V1.5.0
   * @param {string} type for checking
   * @return {boolean} true on OK
   */
  validateType(type) {
    const types = ['on', 'only', 'once', 'onlyOnce']
    return !!types.filter(t => type === t).length;
  }

  /**
   * Run the callback
   * @param {function} callback function to execute
   * @param {array} payload for callback
   * @param {object} ctx context or null
   * @return {void} the result store in $done
   */
  run(callback, payload, ctx) {
    this.logger('run', callback, payload, ctx)
    this.$done = Reflect.apply(callback, ctx, this.toArray(payload))
  }

  /**
   * Take the content out and remove it from store id by the name
   * @param {string} evt event name
   * @param {string} [storeName = lazyStore] name of store
   * @return {object|boolean} content or false on not found
   */
  takeFromStore(evt, storeName = 'lazyStore') {
    let store = this[storeName]; // it could be empty at this point
    if (store) {
      this.logger('takeFromStore', storeName, store)
      if (store.has(evt)) {
        let content = store.get(evt)
        this.logger('takeFromStore', content)
        store.delete(evt)
        return content;
      }
      return false;
    }
    throw new Error(`${storeName} is not supported!`)
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
      this.logger('addToStore', `${evt} existed`)
      fnSet = store.get(evt)
    } else {
      this.logger('addToStore', `create new Set for ${evt}`)
      // this is new
      fnSet = new Set()
    }
    // lazy only store 2 items - this is not the case in V1.6.0 anymore
    // we need to check the first parameter is string or not
    if (args.length > 2) {
      if (Array.isArray(args[0])) { // lazy store
        // check if this type of this event already register in the lazy store
        let [,,t] = args;
        if (!this.checkTypeInLazyStore(evt, t)) {
          fnSet.add(args)
        }
      } else {
        if (!this.checkContentExist(args, fnSet)) {
          this.logger('addToStore', `insert new`, args)
          fnSet.add(args)
        }
      }
    } else { // add straight to lazy store
      fnSet.add(args)
    }
    store.set(evt, fnSet)
    return [store, fnSet.size]
  }

  /**
   * @param {array} args for compare
   * @param {object} fnSet A Set to search from
   * @return {boolean} true on exist
   */
  checkContentExist(args, fnSet) {
    let list = Array.from(fnSet)
    return !!list.filter(l => {
      let [hash,] = l;
      if (hash === args[0]) {
        return true;
      }
      return false;
    }).length;
  }

  /**
   * get the existing type to make sure no mix type add to the same store
   * @param {string} evtName event name
   * @param {string} type the type to check
   * @return {boolean} true you can add, false then you can't add this type
   */
  checkTypeInStore(evtName, type) {
    this.validateEvt(evtName)
    this.validateEvt(type)
    let all = this.$get(evtName, true)
    if (all === false) {
       // pristine it means you can add
      return true;
    }
    // it should only have ONE type in ONE event store
    return !all.filter(list => {
      let [ ,,,t ] = list;
      return type !== t;
    }).length;
  }

  /**
   * This is checking just the lazy store because the structure is different
   * therefore we need to use a new method to check it
   */
  checkTypeInLazyStore(evtName, type) {
    this.validateEvt(evtName)
    this.validateEvt(type)
    let store = this.lazyStore.get(evtName)
    this.logger('checkTypeInLazyStore', store)
    if (store) {
      return !!Array
        .from(store)
        .filter(l => {
          let [,,t] = l;
          return t !== type;
        }).length
    }
    return false;
  }

  /**
   * wrapper to re-use the addToStore,
   * V1.3.0 add extra check to see if this type can add to this evt
   * @param {string} evt event name
   * @param {string} type on or once
   * @param {function} callback function
   * @param {object} context the context the function execute in or null
   * @return {number} size of the store
   */
  addToNormalStore(evt, type, callback, context = null) {
    this.logger('addToNormalStore', evt, type, 'add to normal store')
    // @TODO we need to check the existing store for the type first!
    if (this.checkTypeInStore(evt, type)) {
      this.logger(`${type} can add to ${evt} store`)
      let key = this.hashFnToKey(callback)
      let args = [this.normalStore, evt, key, callback, context, type]
      let [_store, size] = Reflect.apply(this.addToStore, this, args)
      this.normalStore = _store;
      return size;
    }
    return false;
  }

  /**
   * Add to lazy store this get calls when the callback is not register yet
   * so we only get a payload object or even nothing
   * @param {string} evt event name
   * @param {array} payload of arguments or empty if there is none
   * @param {object} [context=null] the context the callback execute in
   * @param {string} [type=false] register a type so no other type can add to this evt
   * @return {number} size of the store
   */
  addToLazyStore(evt, payload = [], context = null, type = false) {
    // this is add in V1.6.0
    // when there is type then we will need to check if this already added in lazy store
    // and no other type can add to this lazy store
    let args = [this.lazyStore, evt, this.toArray(payload), context]
    if (type) {
      args.push(type)
    }
    let [_store, size] = Reflect.apply(this.addToStore, this, args)
    this.lazyStore = _store;
    return size;
  }

  /**
   * make sure we store the argument correctly
   * @param {*} arg could be array
   * @return {array} make sured
   */
  toArray(arg) {
    return Array.isArray(arg) ? arg : [arg];
  }

  /**
   * setter to store the Set in private
   * @param {object} obj a Set
   */
  set normalStore(obj) {
    NB_EVENT_SERVICE_PRIVATE_STORE.set(this, obj)
  }

  /**
   * @return {object} Set object
   */
  get normalStore() {
    return NB_EVENT_SERVICE_PRIVATE_STORE.get(this)
  }

  /**
   * setter to store the Set in lazy store
   * @param {object} obj a Set
   */
  set lazyStore(obj) {
    NB_EVENT_SERVICE_PRIVATE_LAZY.set(this , obj)
  }

  /**
   * @return {object} the lazy store Set
   */
  get lazyStore() {
    return NB_EVENT_SERVICE_PRIVATE_LAZY.get(this)
  }

  /**
   * generate a hashKey to identify the function call
   * The build-in store some how could store the same values!
   * @param {function} fn the converted to string function
   * @return {string} hashKey
   */
  hashFnToKey(fn) {
    return genHaskKey(fn.toString()) + '';
  }
}

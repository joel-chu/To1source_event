// this is the new implementation without the hash key
// only using Map and Set instead
import {
  NB_EVENT_SERVICE_PRIVATE_STORE,
  NB_EVENT_SERVICE_PRIVATE_LAZY
} from './store'
import genHaskKey from './hash-code.js'
// export
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
    // we need to init the store first otherwise it could be a lot of checking later
    this.normalStore = new Map()
    this.lazyStore = new Map()
  }

  /**
   * logger function for overwrite
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
    this.validate(evt, callback)
    // first need to check if this evt is in lazy store
    let lazyStoreContent = this.takeFromStore(evt)
    // this is normal register first then call later
    if (lazyStoreContent === false) {
      this.logger('$on', `${evt} callback is not in lazy store`)
      // @TODO we need to check if there was other listener to this
      // event and are they the same type then we could solve that
      // register the different type to the same event name

      return this.addToNormalStore(evt, type, callback, context)
    }
    this.logger('$on', `${evt} found in lazy store`)
    // this is when they call $trigger before register this callback
    let size = 0;
    lazyStoreContent.forEach(content => {
      let [ payload, ctx ] = content;
      this.run(callback, payload, context || ctx)
      size += this.addToNormalStore(evt, type, callback, context || ctx)
    })
    return size;
  }

  /**
   * once only registered it once, there is no overwrite option here
   * @NOTE change in v1.3.0 $once can add multiple listeners
   *       but once the event fired, it will remove this event (see $only)
   * @param {string} evt name
   * @param {function} callback to execute
   * @param {object} [context=null] the handler execute in
   * @return {boolean} result
   */
  $once(evt , callback , context = null) {
    this.validate(evt, callback)
    let lazyStoreContent = this.takeFromStore(evt)
    // this is normal register before call $trigger
    let nStore = this.normalStore;
    if (lazyStoreContent === false) {
      this.logger('$once', `${evt} not in the lazy store`)
      // v1.3.0 $once now allow to add multiple listeners
      return this.addToNormalStore(evt, 'once', callback, context)
    } else {
      // now this is the tricky bit
      // there is a potential bug here that cause by the developer
      // if they call $trigger first, the lazy won't know it's a once call
      // so if in the middle they register any call with the same evt name
      // then this $once call will be fucked - add this to the documentation
      this.logger('$once', lazyStoreContent)
      const list = Array.from(lazyStoreContent)
      // should never have more than 1
      const [ payload, ctx ] = list[0]
      this.run(callback, payload, context || ctx)
      // remove this evt from store
      this.$off(evt)
    }
  }

  /**
   * This one event can only bind one callbackback
   * @param {string} evt event name
   * @param {function} callback event handler
   * @param {object} [context=null] the context the event handler execute in
   * @return {boolean} true bind for first time, false already existed
   */
  $only(evt, callback, context = null) {
    this.validate(evt, callback)
    let added = false;
    let lazyStoreContent = this.takeFromStore(evt)
    // this is normal register before call $trigger
    let nStore = this.normalStore;
    if (!nStore.has(evt)) {
      this.logger(`$only`, `${evt} add to store`)
      added = this.addToNormalStore(evt, 'only', callback, context)
    }
    if (lazyStoreContent !== false) {
      // there are data store in lazy store
      this.logger('$only', `${evt} found data in lazy store to execute`)
      const list = Array.from(lazyStoreContent)
      // $only allow to trigger this multiple time on the single handler
      list.forEach( l => {
        const [ payload, ctx ] = l;
        this.run(callback, payload, context || ctx)
      })
    }
    return added;
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
    this.logger('$trigger', nStore)
    if (nStore.has(evt)) {
      this.logger('$trigger', evt, 'found')
      let nSet = Array.from(nStore.get(evt))
      let ctn = nSet.length;
      let hasOnce = false;
      let hasOnly = false;
      for (let i=0; i < ctn; ++i) {
        found = i;
        let [ _, callback, ctx, type ] = nSet[i]
        this.run(callback, payload, context || ctx)
        if (type === 'once') {
          hasOnce = true;
        }
      }
      if (hasOnce) {
        nStore.delete(evt)
      }
      return found;
    }
    // now this is not register yet
    this.addToLazyStore(evt, payload, context)
    return found;
  }

  /**
   * this is an alias to the $trigger
   * @param {array} args spread
   */
  $call(...args) {
    this.logger('$call', args)
    return Reflect.apply(this.$trigger, this, args)
  }

  /**
   * remove the evt from all the stores
   * @param {string} evt name
   * @return {boolean} true actually delete something
   */
  $off(evt) {
    this.validateEvt(evt)
    let stores = [ this.lazyStore, this.normalStore ]
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
   * @param {boolean} [full=false] if true then return the entire content
   * @return {array|boolean} listerner(s) or false when not found
   */
  $get(evt, full = false) {
    this.validateEvt(evt)
    let store = this.normalStore;
    if (store.has(evt)) {
      return Array
        .from(store.get(evt))
        .map( l => {
          if (full) {
            return l;
          }
          let [key, callback, ] = l;
          return callback;
        })
    }
    return false;
  }

  /**
   * store the return result from the run
   * @param {*} value whatever return from callback
   */
  set $done(value) {
    this.logger('set $done', value)
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
    this.logger('takeFromStore', storeName, store)
    if (store.has(evt)) {
      let content = store.get(evt)
      this.logger('takeFromStore', content)
      store.delete(evt)
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
      this.logger('addToStore', `${evt} existed`)
      fnSet = store.get(evt)
    } else {
      this.logger('addToStore', `create new Set for ${evt}`)
      // this is new
      fnSet = new Set()
    }
    let ctn = args.length;
    // lazy only store 2 items!
    if (ctn > 2) {
      if (!this.checkContentExist(args, fnSet)) {
        this.logger('addToStore', `insert new`, args)
        fnSet.add(args)
      }
    } else { // just add if this is a lazy store
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
      let [ ,,,t ] =list;
      return type !== t;
    }).length;
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
      let [_store, size] = this.addToStore(this.normalStore, evt, key, callback, context, type)
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
   * @param {object} context the context the callback execute in
   * @return {number} size of the store
   */
  addToLazyStore(evt, payload = [], context = null) {
    let [_store, size] = this.addToStore(this.lazyStore, evt, this.toArray(payload), context)
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

import NbEventServiceBase from './privates'
// export
export default class EventService extends NbEventServiceBase {
  /**
   * class constructor
   */
  constructor(config = {}) {
    super(config)
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
      let [ payload, ctx, t ] = content;
      if (t && t !== type) {
        throw new Error(`You are trying to register an event already been taken by other type: ${t}`)
      }
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
    const type = 'once';
    let lazyStoreContent = this.takeFromStore(evt)
    // this is normal register before call $trigger
    let nStore = this.normalStore;
    if (lazyStoreContent === false) {
      this.logger('$once', `${evt} not in the lazy store`)
      // v1.3.0 $once now allow to add multiple listeners
      return this.addToNormalStore(evt, type, callback, context)
    } else {
      // now this is the tricky bit
      // there is a potential bug here that cause by the developer
      // if they call $trigger first, the lazy won't know it's a once call
      // so if in the middle they register any call with the same evt name
      // then this $once call will be fucked - add this to the documentation
      this.logger('$once', lazyStoreContent)
      const list = Array.from(lazyStoreContent)
      // should never have more than 1
      const [ payload, ctx, t ] = list[0]
      if (t && t !== type) {
        throw new Error(`You are trying to register an event already been taken by other type: ${t}`)
      }
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
    const type = 'only';
    let added = false;
    let lazyStoreContent = this.takeFromStore(evt)
    // this is normal register before call $trigger
    let nStore = this.normalStore;
    if (!nStore.has(evt)) {
      this.logger(`$only`, `${evt} add to store`)
      added = this.addToNormalStore(evt, type, callback, context)
    }
    if (lazyStoreContent !== false) {
      // there are data store in lazy store
      this.logger('$only', `${evt} found data in lazy store to execute`)
      const list = Array.from(lazyStoreContent)
      // $only allow to trigger this multiple time on the single handler
      list.forEach( l => {
        const [ payload, ctx, t ] = l;
        if (t && t !== type) {
          throw new Error(`You are trying to register an event already been taken by other type: ${t}`)
        }
        this.run(callback, payload, context || ctx)
      })
    }
    return added;
  }

  /**
   * $only + $once this is because I found a very subtile bug when we pass a
   * resolver, rejecter - and it never fire because that's OLD adeed in v1.4.0
   * @param {string} evt event name
   * @param {function} callback to call later
   * @param {object} [context=null] exeucte context
   * @return {void}
   */
  $onlyOnce(evt, callback, context = null) {
    this.validate(evt, callback)
    const type = 'onlyOnce';
    let added = false;
    let lazyStoreContent = this.takeFromStore(evt)
    // this is normal register before call $trigger
    let nStore = this.normalStore;
    if (!nStore.has(evt)) {
      this.logger(`$onlyOnce`, `${evt} add to store`)
      added = this.addToNormalStore(evt, type, callback, context)
    }
    if (lazyStoreContent !== false) {
      // there are data store in lazy store
      this.logger('$onlyOnce', lazyStoreContent)
      const list = Array.from(lazyStoreContent)
      // should never have more than 1
      const [ payload, ctx, t ] = list[0]
      if (t && t !== 'onlyOnce') {
        throw new Error(`You are trying to register an event already been taken by other type: ${t}`)
      }
      this.run(callback, payload, context || ctx)
      // remove this evt from store
      this.$off(evt)
    }
    return added;
  }

  /**
   * This is a shorthand of $off + $on added in V1.5.0
   * @param {string} evt event name
   * @param {function} callback to exeucte
   * @param {object} [context = null] or pass a string as type
   * @param {string} [type=on] what type of method to replace
   * @return {}
   */
  $replace(evt, callback, context = null, type = 'on') {
    if (this.validateType(type)) {
      this.$off(evt)
      let method = this['$' + type]
      return Reflect.apply(method, this, [evt, callback, context])
    }
    throw new Error(`${type} is not supported!`)
  }

  /**
   * trigger the event
   * @param {string} evt name NOT allow array anymore!
   * @param {mixed} [payload = []] pass to fn
   * @param {object|string} [context = null] overwrite what stored
   * @param {string} [type=false] if pass this then we need to add type to store too
   * @return {number} if it has been execute how many times
   */
  $trigger(evt , payload = [] , context = null, type = false) {
    this.validateEvt(evt)
    let found = 0;
    // first check the normal store
    let nStore = this.normalStore;
    this.logger('$trigger', nStore)
    if (nStore.has(evt)) {
      this.logger('$trigger', evt, 'found')
      // @1.8.0 to add the suspend queue
      let added = this.$queue(evt, payload, context, type)
      if (added === false) {
        let nSet = Array.from(nStore.get(evt))
        let ctn = nSet.length;
        let hasOnce = false;
        let hasOnly = false;
        for (let i=0; i < ctn; ++i) {
          ++found;
          // this.logger('found', found)
          let [ _, callback, ctx, type ] = nSet[i]
          this.run(callback, payload, context || ctx)
          if (type === 'once' || type === 'onlyOnce') {
            hasOnce = true;
          }
        }
        if (hasOnce) {
          nStore.delete(evt)
        }
        return found;
      }
      return false; // not executed
    }
    // now this is not register yet
    this.addToLazyStore(evt, payload, context, type)
    return found;
  }

  /**
   * this is an alias to the $trigger
   * @NOTE breaking change in V1.6.0 we swap the parameter around
   * @param {string} evt event name
   * @param {*} params pass to the callback
   * @param {string} type of call
   * @param {object} context what context callback execute in
   * @return {*} from $trigger
   */
  $call(evt, params, type = false, context = null) {
    let args = [evt, params]
    args.push(context, type)
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
    if (this.keep) {
      this.result.push(value)
    } else {
      this.result = value;
    }
  }

  /**
   * @TODO is there any real use with the keep prop?
   * getter for $done
   * @return {*} whatever last store result
   */
  get $done() {
    if (this.keep) {
      this.logger(this.result)
      return this.result[this.result.length - 1]
    }
    return this.result;
  }


}

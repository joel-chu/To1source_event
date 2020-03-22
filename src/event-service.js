// The top level
import {
  ON_TYPE,
  ONLY_TYPE,
  ONCE_TYPE,
  ONLY_ONCE_TYPE,
  MAX_CALL_TYPE,
  ON_MAX_TYPES,
  TAKEN_BY_OTHER_TYPE_ERR,
  NEG_RETURN
} from './constants'
import { isInt, inArray } from './utils'
import StoreService from './store-service'
// export
export default class EventService extends StoreService {
  /**
   * class constructor
   */
  constructor(config = {}) {
    super(config)
  }

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
    const type = 'on'
    this.validate(evt, callback)
    // first need to check if this evt is in lazy store
    let lazyStoreContent = this.takeFromStore(evt)
    // this is normal register first then call later
    if (lazyStoreContent === false) {
      this.logger(`($on) "${evt}" is not in lazy store`)
      // @TODO we need to check if there was other listener to this
      // event and are they the same type then we could solve that
      // register the different type to the same event name
      return this.addToNormalStore(evt, type, callback, context)
    }
    this.logger(`($on) ${evt} found in lazy store`)
    // this is when they call $trigger before register this callback
    let size = 0
    lazyStoreContent.forEach(content => {
      let [ payload, ctx, t ] = content
      if (t && t !== type) {
        throw new Error(`${TAKEN_BY_OTHER_TYPE_ERR} ${t}`)
      }
      this.logger(`($on)`, `call run "${evt}"`)
      this.run(callback, payload, context || ctx)
      size += this.addToNormalStore(evt, type, callback, context || ctx)
    })

    this.logger(`($on) return size ${size}`)
    return size
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
    // let nStore = this.normalStore
    if (lazyStoreContent === false) {
      this.logger(`($once) "${evt}" is not in the lazy store`)
      // v1.3.0 $once now allow to add multiple listeners
      return this.addToNormalStore(evt, ONCE_TYPE, callback, context)
    } else {
      // now this is the tricky bit
      // there is a potential bug here that cause by the developer
      // if they call $trigger first, the lazy won't know it's a once call
      // so if in the middle they register any call with the same evt name
      // then this $once call will be fucked - add this to the documentation
      this.logger('($once)', lazyStoreContent)
      const list = Array.from(lazyStoreContent)
      // should never have more than 1
      const [ payload, ctx, t ] = list[0]
      if (t && t !== ONCE_TYPE) {
        throw new Error(`${TAKEN_BY_OTHER_TYPE_ERR} ${t}`)
      }
      this.logger('($once)', `call run "${evt}"`)
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

    let added = false
    let lazyStoreContent = this.takeFromStore(evt)
    // this is normal register before call $trigger
    let nStore = this.normalStore

    if (!nStore.has(evt)) {
      this.logger(`($only) "${evt}" add to normalStore`)

      added = this.addToNormalStore(evt, ONLY_TYPE, callback, context)
    }

    if (lazyStoreContent !== false) {
      // there are data store in lazy store
      this.logger(`($only) "${evt}" found data in lazy store to execute`)
      const list = Array.from(lazyStoreContent)
      // $only allow to trigger this multiple time on the single handler
      list.forEach( li => {
        const [ payload, ctx, t ] = li
        if (t && t !== ONLY_TYPE) {
          throw new Error(`${TAKEN_BY_OTHER_TYPE_ERR} ${t}`)
        }
        this.logger(`($only) call run "${evt}"`)
        this.run(callback, payload, context || ctx)
      })
    }

    return added
  }

  /**
   * $only + $once this is because I found a very subtile bug when we pass a
   * resolver, rejecter - and it never fire because that's OLD added in v1.4.0
   * @param {string} evt event name
   * @param {function} callback to call later
   * @param {object} [context=null] exeucte context
   * @return {void}
   */
  $onlyOnce(evt, callback, context = null) {
    this.validate(evt, callback)

    let added = false
    let lazyStoreContent = this.takeFromStore(evt)
    // this is normal register before call $trigger
    let nStore = this.normalStore
    if (!nStore.has(evt)) {
      this.logger(`($onlyOnce) "${evt}" add to normalStore`)

      added = this.addToNormalStore(evt, ONLY_ONCE_TYPE, callback, context)
    }

    if (lazyStoreContent !== false) {
      // there are data store in lazy store
      this.logger('($onlyOnce)', lazyStoreContent)
      const list = Array.from(lazyStoreContent)
      // should never have more than 1
      const [ payload, ctx, t ] = list[0]
      if (t && t !== ONLY_ONCE_TYPE) {
        throw new Error(`${TAKEN_BY_OTHER_TYPE_ERR} ${t}`)
      }
      this.logger(`($onlyOnce) call run "${evt}"`)

      this.run(callback, payload, context || ctx)
      // remove this evt from store
      this.$off(evt)
    }
    return added
  }

  /**
   * change the way how it suppose to work, instead of create another new store
   * We perform this check on the trigger end, so we set the number max
   * whenever we call the callback, we increment a value in the store
   * once it reaches that number we remove that event from the store,
   * also this will not get add to the lazy store,
   * which means the event must register before we can fire it
   * therefore we don't have to deal with the backward check
   * @param {string} evtName the event to get pre-registered
   * @param {number} max pass the max amount of callback can add to this event
   * @param {*} [ctx=null] the context the callback execute in
   * @return {function} the event handler
   */
  $max(evtName, max, ctx = null) {
    this.validateEvt(evtName)
    if (isInt(max) && max > 0) {
      // find this in the normalStore
      const fnSet = this.$get(evtName, true)
      if (fnSet !== false) {
        const evts = this.searchMapEvt(evtName)
        if (evts.length) {
          // should only have one anyway
          const [,,,type] = evts[0]
          // now init the max store
          const value = this.checkMaxStore(evtName, max)
          const _self = this
          // construct the callback
          return function executeMaxCall(...args) {
            const ctn = _self.getMaxStore(evtName)
            let value = NEG_RETURN
            if (ctn > 0) {
              const fn = _self.$call(evtName, type, ctx)
              Reflect.apply(fn, _self, args)
              
              value = _self.checkMaxStore(evtName)
              if (value === NEG_RETURN) {
                _self.$off(evtName)
                return NEG_RETURN
              }
            }
            return value
          }
        }
      }
      throw new Error(`The ${evtName} is not registered, can not execute non-existing event at the moment`)
    }
    throw new Error(`Expect max to be an integer and greater than zero! But we got [${typeof max}]${max} instead`)
  }

  /**
   * This is a shorthand of $off + $on added in V1.5.0
   * @param {string} evt event name
   * @param {function} callback to exeucte
   * @param {object} [context = null] or pass a string as type
   * @param {string} [type=on] what type of method to replace
   * @return {*}
   */
  $replace(evt, callback, context = null, type = ON_TYPE) {
    if (this.validateType(type)) {
      this.$off(evt)
      let method = this['$' + type]

      this.logger(`($replace)`, evt, callback)

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
    let found = 0
    // first check the normal store
    let nStore = this.normalStore
    this.logger('($trigger) normalStore', nStore)
    if (nStore.has(evt)) {
      this.logger(`($trigger) "${evt}" found`)
      // @1.8.0 to add the suspend queue
      let added = this.$queue(evt, payload, context, type)
      if (added) {
        this.logger(`($trigger) Currently suspended "${evt}" added to queue, nothing executed. Exit now.`)
        return false // not executed
      }
      let nSet = Array.from(nStore.get(evt))
      let ctn = nSet.length
      let hasOnce = false
      // let hasOnly = false
      for (let i=0; i < ctn; ++i) {
        ++found
        // this.logger('found', found)
        let [ _, callback, ctx, _type ] = nSet[i]
        this.logger(`($trigger) call run for ${type}:${evt}`)

        this.run(callback, payload, context || ctx)

        if (_type === 'once' || _type === 'onlyOnce') {
          hasOnce = true
        }
      }
      if (hasOnce) {
        nStore.delete(evt)
      }
      return found
    }
    // now this is not register yet
    this.addToLazyStore(evt, payload, context, type)
    return found
  }

  /**
   * this is an alias to the $trigger
   * @NOTE breaking change in V1.6.0 we swap the parameter aroun
   * @NOTE breaking change: v1.9.1 it return an function to accept the params as spread
   * @param {string} evt event name
   * @param {string} type of call
   * @param {object} context what context callback execute in
   * @return {*} from $trigger
   */
  $call(evt, type = false, context = null) {
    const ctx = this

    return function executeCall(...args) {
      let _args = [evt, args, context, type]

      return Reflect.apply(ctx.$trigger, ctx, _args)
    }
  }

  /**
   * remove the evt from all the stores
   * @param {string} evt name
   * @return {boolean} true actually delete something
   */
  $off(evt) {
    // @TODO we will allow a regex pattern to mass remove event
    this.validateEvt(evt)
    let stores = [ this.lazyStore, this.normalStore ]

    return !!stores
          .filter(store => store.has(evt))
          .map(store => this.removeFromStore(evt, store))
          .length
  }

  /**
   * return all the listener bind to that event name
   * @param {string} evtName event name
   * @param {boolean} [full=false] if true then return the entire content
   * @return {array|boolean} listerner(s) or false when not found
   */
  $get(evt, full = false) {
    // @TODO should we allow the same Regex to search for all?
    this.validateEvt(evt)
    let store = this.normalStore
    return this.findFromStore(evt, store, full)
  }

  /**
   * store the return result from the run
   * @param {*} value whatever return from callback
   */
  set $done(value) {
    this.logger('($done) set value: ', value)
    if (this.keep) {
      this.result.push(value)
    } else {
      this.result = value
    }
  }

  /**
   * @TODO is there any real use with the keep prop?
   * getter for $done
   * @return {*} whatever last store result
   */
  get $done() {
    this.logger('($done) get result:', this.result)
    if (this.keep) {
      return this.result[this.result.length - 1]
    }
    return this.result
  }

  /**
   * Take a look inside the stores
   * @param {number|null} idx of the store, null means all
   * @return {void}
   */
  $debug(idx = null) {
    let names = ['lazyStore', 'normalStore']
    let stores = [this.lazyStore, this.normalStore]
    if (stores[idx]) {
      this.logger(names[idx], stores[idx])
    } else {
      stores.map((store, i) => {
        this.logger(names[i], store)
      })
    }
  }
}

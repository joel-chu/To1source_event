// Create two WeakMap store as a private keys
import type {
  ClassConfig,
  EvtName,
  StoreContent,
  StoreType,
  CallbackType,
  StoreNameKey
} from './lib/types'
import {
  NEG_RETURN,
  ON_MAX_TYPES
} from './lib/constants'
import { isInt, inArray, toArray } from './lib/utils'
import { BaseClass } from './base'

// def
export class StoresClass extends BaseClass {

  private normalStore = new Map<EvtName, StoreContent>()
  private lazyStore = new Map<EvtName, StoreContent>()
  private maxCountStore = new Map<EvtName, number>()
  // reserved for future development
  protected keep = false
  // useful in many places
  public _stores = ['lazyStore', 'normalStore']

  constructor(config: ClassConfig = {}) {
    super(config)
    this.keep = !!config.keep
  }

  /**
   * We need this to pre-check the store, otherwise
   * the execution will be unable to determine the number of calls
   */
  public getMaxStore (evtName: EvtName): number {
    return this.maxCountStore.get(evtName) || NEG_RETURN
  }

  /**
   * This is one stop shop to check and munipulate the maxStore
   */
  public checkMaxStore (evtName: EvtName, max: number | null = null) {
    this.logger('===========================================')
    this.logger('checkMaxStore start', evtName, max)
    // init the store
    if (max !== null && isInt(max)) {
      // because this is the setup phrase we just return the max value
      this.maxCountStore.set(evtName, max)
      this.logger(`Setup max store for ${String(evtName)} with ${max}`)
      return max
    }
    if (max === null) {
      // first check if this exist in the maxStore
      let value = this.getMaxStore(evtName)
      this.logger('getMaxStore value', value)
      if (value !== NEG_RETURN) {
        if (value > 0) {
          --value
        }
        if (value > 0) {
          this.maxCountStore.set(evtName, value) // just update the value
        } else {
          this.maxCountStore.delete(evtName) // just remove it
          this.logger(`remove ${String(evtName)} from maxStore`)
          return NEG_RETURN
        }
      }
      return value
    }
    throw new Error(`Expect max to be an integer, but we got ${typeof max} ${max}`)
  }

  /**
   * return all the listener bind to that event name
   */
  public $get (evtName: EvtName, full = false) {
    // @TODO should we allow the same Regex to search for all?
    this._validateEvt(evtName)
    const store = this.normalStore
    return this.findFromStore(evtName, store, full)
  }

  /**
   * this was implement in the event class before
   * in V.2 we implement here and just let event $off calls it
   * @TODO since we want to pass a RegExp then we only do the remove here without checking
   */
  public $remove(evt: EvtName): boolean {
    const stores = [this.normalStore, this.lazyStore]
    return !!stores
      .filter(store => store.has(evt))
      .map(store => this.removeFromStore(evt, store))
      .length
  }

  /**
   * V.2 move from event class to here
   */
  public $debug (idx: number | null) {
    const names = this._stores
    const stores = [this.lazyStore, this.normalStore]
    if (idx === null) {
      stores.map((store, i) => {
        this.logger(names[i], store)
      })
    } else {
      this.logger(names[idx], stores[idx])
    }
  }

  /**
   * Wrap several get filter ops together to return the callback we are looking for
   */
  public searchMapEvt (evtName: EvtName) {
    const evts = this.$get(evtName, true) as unknown as Array<StoreContent>// return in full
    const search = evts.filter((result: StoreContent) => {
      const [,,, type] = result
      return inArray(ON_MAX_TYPES, type)
    })

    return search.length ? search : []
  }

  /**
   * Take the content out and remove it from store id by the name
   */
  public takeFromStore (
    evt: EvtName,
    storeName: string = 'lazyStore'
  ): boolean | StoreContent {
    const store = this[storeName as StoreNameKey] // it could be empty at this point
    if (store) {
      this.logger('(takeFromStore)', storeName, store)
      if (store.has(evt)) {
        const content = store.get(evt)
        this.logger(`(takeFromStore) has "${String(evt)}"`, content)
        store.delete(evt)
        return content as StoreContent
      }
      return false
    }
    throw new Error(`"${storeName}" is not supported!`)
  }

  /**
   * This was part of the $get. We take it out
   * so we could use a regex to remove more than one event
   */
  public findFromStore (
    evt: EvtName,
    store: StoreType,
    full = false
  ) {
    if (store.has(evt)) {
      return Array
        .from(store.get(evt) as unknown as Set<unknown>)
        .map(list => {
          if (full) {
            return list
          }
          const [, callback] = list as Array<any>
          return callback
        })
    }
    return false
  }

  /**
   * Similar to the findFromStore, but remove
   */
  public removeFromStore (
    evt: EvtName,
    store: StoreType
  ): boolean {
    if (store.has(evt)) {
      this.logger('($off)', evt)
      store.delete(evt)
      return true
    }
    return false
  }

  /**
   * Take out from addToStore for reuse
   * @NOTE the param order is different because this operation follow this order
   */
  public getStoreSet<T> (
    store: StoreType,
    evt: EvtName
  ): Set<T> {
    let fnSet
    if (store.has(evt)) {
      this.logger(`(addToStore) "${String(evt)}" existed`)
      fnSet = store.get(evt)
    } else {
      this.logger(`(addToStore) create new Set for "${String(evt)}"`)
      // this is new
      fnSet = new Set()
    }
    return fnSet as Set<T>
  }

  /**
   * The add to store step is similar so make it generic for resuse
   * @param {object} store which store to use
   */
  addToStore (
    store: StoreType,
    evt: EvtName,
    ...args: Array<any> // @TODO
  ) {
    const fnSet = this.getStoreSet(store, evt)
    // lazy only store 2 items - this is not the case in V1.6.0 anymore
    // we need to check the first parameter is string or not
    if (args.length > 2) {
      if (Array.isArray(args[0])) { // lazy store
        // check if this type of this event already register in the lazy store
        const [,, type] = args
        if (!this.checkTypeInLazyStore(evt, type)) {
          fnSet.add(args)
        }
      } else {
        if (!this.checkContentExist(args, fnSet)) {
          this.logger('(addToStore) insert new', args)
          fnSet.add(args)
        }
      }
    } else { // add straight to lazy store
      fnSet.add(args)
    }
    store.set(evt, fnSet as unknown as StoreContent)

    return [store, fnSet.size]
  }

  /**
   * check if certain content exist using args to search
   */
  checkContentExist (
    args: Array<any>,
    fnSet: Set<any>
  ): boolean {
    const list = Array.from(fnSet)
    return !!list.filter(_list => {
      const [hash] = _list
      return hash === args[0]
    }).length
  }

  /**
   * get the existing type to make sure no mix type add to the same store
   * @param {string} evtName event name
   * @param {string} type the type to check
   * @return {boolean} true you can add, false then you can't add this type
   */
  checkTypeInStore (
    evtName: EvtName,
    type: string
  ): boolean {
    this._validateEvt(evtName, type)
    const all = this.$get(evtName, true)
    if (all === false) {
      // pristine it means you can add
      return true
    }
    // it should only have ONE type in ONE event store
    return !all.filter(list => {
      const [,,, t] = list
      return type !== t
    }).length
  }

  /**
   * This is checking just the lazy store because the structure is different
   * therefore we need to use a new method to check it
   */
  checkTypeInLazyStore (
    evtName: EvtName,
    type: string
  ): boolean {
    this._validateEvt(evtName, type)
    const store = this.lazyStore.get(evtName)
    this.logger('(checkTypeInLazyStore)', store)
    if (store) {
      return !!Array
        .from(store)
        .filter(li => {
          const [,, t] = li as Array<StoreContent>
          return t as unknown as string !== type
        }).length
    }
    return false
  }

  /**
   * check if the event name exist in the store
   * @TODO what we need to do is check both store
   * and return where we find it
   */
  has(
    evtName: EvtName,
    storeName: string = 'normalStore'
  ) {
    const store = this[storeName as StoreNameKey]
    return store.has(evtName)
  }

  /**
   * check if this evtName register in one of the store
   * and return where we finds it
   */
  isIn(
    evtName: EvtName
  ): string | boolean {
    const ctn = this._stores.length
    for (let i = 0; i < ctn; ++i) {
      const name = this._stores[i]
      if (this.has(evtName, name)) {
        return name
      }
    }
    return false
  }

  /**
   * wrapper to re-use the addToStore,
   * V1.3.0 add extra check to see if this type can add to this evt
   */
  addToNormalStore<T, S> (
    evt: EvtName,
    type: string,
    callback: CallbackType<T, S>,
    context = null
  ) {
    this.logger(`(addToNormalStore) try to add "${type}" --> "${String(evt)}" to normal store`)
    // @TODO we need to check the existing store for the type first!
    if (this.checkTypeInStore(evt, type)) {
      this.logger('(addToNormalStore)', `"${type}" --> "${String(evt)}" can add to normal store`)

      const key = this._hashFnToKey(callback)
      const args = [this.normalStore, evt, key, callback, context, type]
      const [_store, size] = Reflect.apply(this.addToStore, this, args)
      this.normalStore = _store

      return size
    }

    return false
  }

  /**
   * Add to lazy store this get calls when the callback is not register yet
   * so we only get a payload object or even nothing
   */
  addToLazyStore (
    evt: EvtName,
    payload: Array<StoreContent>,
    context: unknown | null = null,
    type: string | boolean = false
  ) {
    // this is add in V1.6.0
    // when there is type then we will need to check if this already added in lazy store
    // and no other type can add to this lazy store
    const args = [this.lazyStore, evt, toArray(payload), context]
    if (type) {
      args.push(type)
    }
    const [_store, size] = Reflect.apply(this.addToStore, this, args)
    this.lazyStore = _store
    this.logger(`(addToLazyStore) size: ${size}`)

    return size
  }

}

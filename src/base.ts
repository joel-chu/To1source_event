// setup a base class to put all the share methods
import type {
  ClassConfig,
  // CallbackHandler,
  CallbackType,
  DebugResult
} from './lib/types'

import { hashCode2Str, trueTypeOf, toArray, inArray } from './lib/utils'
import { AVAILABLE_TYPES, PKG_NAME, EVT_NAME_TYPES } from './lib/constants'

// def
export class BaseClass {

  protected keep = false
  private result: DebugResult

  constructor(config: ClassConfig = {}) {
    // override the logger method
    if (config.logger && trueTypeOf(config.logger) === 'function') {
      this.logger = config.logger
    }
    this.keep = !!config.keep
  }

  protected logger(..._: Array<unknown>) {}

  get $name () {
    return PKG_NAME
  }

  // @TODO should also suport symbol
  protected _validateEvt (...evt: Array<unknown>): boolean {
    evt.forEach((e: unknown) => {
      const t = trueTypeOf(e)
      if (!inArray(EVT_NAME_TYPES, t)) {
        this.logger('ERROR: validteEvt', t)
        throw new Error(`Event name must be ${EVT_NAME_TYPES.join(' or ')} type! we got ${t}`)
      }
    })
    return true
  }
  // combine validation
  protected _validate (evt: unknown, callback: unknown): boolean {
    if (this._validateEvt(evt)) {
      if (trueTypeOf(callback) === 'function') {
        return true
      }
    }
    throw new Error(`callback required a function! we got ${typeof callback}`)
  }

  // Check if this type is correct or not added in V1.5.0
  protected _validateEvtType (type: unknown): boolean {
    this._validateEvt(type)

    return inArray(AVAILABLE_TYPES, type)
  }

  // encode the function to a hash key
  protected _hashFnToKey (fn: unknown) {
    return hashCode2Str((fn as Function).toString())
  }

  // execute the callback
  // V.2 use generics
  protected _run<T,S> (
    callback: CallbackType<T, S>,
    payload: unknown,
    ctx: unknown
  ) {
    this.logger('(run) callback:', callback, 'payload:', payload, 'context:', ctx)
    this.$done = Reflect.apply(callback, ctx, toArray(payload))

    return this.$done // return it here first
  }

  /**
   * store the return result from the run
   */
  set $done (value) {
    this.logger('($done) set value: ', value)
    if (this.keep) {
      (this.result as Array<unknown>).push(value)
    } else {
      this.result = value
    }
  }

  /**
   * @TODO is there any real use with the keep prop?
   * getter for $done
   */
  get $done () {
    this.logger('($done) get result:', this.result)
    if (this.keep) {
      const _result = this.result as Array<unknown>
      return _result[_result.length - 1]
    }
    return this.result
  }

}

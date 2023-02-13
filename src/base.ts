// setup a base class to put all the share methods
import type { ClassConfig } from './lib/types'
import { hashCode2Str, trueTypeOf, toArray, inArray } from './lib/utils'
import { AVAILABLE_TYPES, PKG_NAME, EVT_NAME_TYPES } from './lib/constants'


export declare type CallbackHandler = (this: unknown, ...args: unknown[]) => unknown
// def
export class BaseClass {

  protected $done: unknown

  constructor(config: ClassConfig = {}) {
    // override the logger method
    if (config.logger && trueTypeOf(config.logger) === 'function') {
      this.logger = config.logger
    }
  }
  // @ts-ignore
  protected logger(...args: Array<unknown>) {}

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
  protected _run (
    callback: CallbackHandler,
    payload: unknown,
    ctx: unknown
  ) {
    this.logger('(run) callback:', callback, 'payload:', payload, 'context:', ctx)
    this.$done = Reflect.apply(callback, ctx, toArray(payload))

    return this.$done // return it here first
  }

}

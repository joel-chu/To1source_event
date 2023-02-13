// setup a base class to put all the share methods
import { hashCode2Str, isString, trueTypeOf } from './lib/utils'
import { AVAILABLE_TYPES, PKG_NAME } from './lib/constants'
// types
export declare type EventClassConfig = {
  logger?: (...args: Array<unknown>) => void
}
// def
export default class BaseClass {

  constructor(config: EventClassConfig = {}) {
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
      if (!isString(e)) {
        this.logger('ERROR: validteEvt', e)
        throw new Error(`Event name must be string type! we got ${typeof e}`)
      }
    })
    return true
  }


}

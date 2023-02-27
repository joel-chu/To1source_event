// this is an alias class that will create several alias method to their counter part
// that will match up the other EventEmitter library out there for the developer to swap over
// this will also get build into the dist folder, only we are only use the export property to
// map different output

import { EventClass } from './event'

export default class AliasEventClass extends EventClass {
  
  constructor (options = {}) {
    super(options)
  }

  on (...args: Array<unknown>) {
    return Reflect.apply(this.$on, this, args)
  }

  off (...args: Array<unknown>) {
    return Reflect.apply(this.$off, this, args)
  }

  emit (...args: Array<unknown>) {
    return Reflect.apply(this.$trigger, this, args)
  }

  once (...args: Array<unknown>) {
    return Reflect.apply(this.$once, this, args)
  }

  only (...args: Array<unknown>) {
    return Reflect.apply(this.$only, this, args)
  }

  onlyOnce (...args: Array<unknown>) {
    return Reflect.apply(this.$onlyOnce, this, args)
  }

  get (...args: Array<unknown>) {
    return Reflect.apply(this.$get, this, args)
  }

  replace (...args: Array<unknown>) {
    return Reflect.apply(this.$replace, this, args)
  }
}

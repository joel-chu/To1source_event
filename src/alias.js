// this is an alias class that will create several alias method to their counter part
// that will match up the other EventEmitter library out there for the developer to swap over

import EventService from './event-service'

export default class AliasEventService extends EventService {

  constructor(options = {}) {
    super(options)
  }

  on(...args) {
    return Reflect.apply(this.$on, this, args)
  }

  off(...args) {
    return Reflect.apply(this.$off, this, args)
  }

  emit(...args) {
    return Reflect.apply(this.$trigger, this, args)
  }

  once(...args) {
    return Reflect.apply(this.$once, this, args)
  }

  only(...args) {
    return Reflect.apply(this.$only, this, args)
  }

  get(...args) {
    return Reflect.apply(this.$get, this, args)
  }
}

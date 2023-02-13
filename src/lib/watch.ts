// a polyfill to create global watch method
// from https://abdulapopoola.com/2015/04/17/how-to-watch-variables-in-javascript/
// without own modification to make it NOT polluting the global prototype chain
class WatchClass {}
export declare type WatchProps = any; // @TODO stub it for now
export declare type CallbackHandler = (...args: any[]) => void
// @ts-ignore @TODO upgrade it with Proxy
if (!WatchClass.prototype.watch) {
  Object.defineProperty(WatchClass.prototype, 'watch', {
    enumerable: false,
    configurable: true,
    writable: false,
    value: function (prop: WatchProps, handler: CallbackHandler) {
      var old = this[prop]
      var cur = old
      var getter = function () {
        return cur
      }
      var setter = function (val: unknown) {
        old = cur
        // We change the order of the params
        // @ts-ignore this is untyped
        cur = handler.call(this, val, prop, old)

        return cur
      }
      // can't watch constants
      if (delete this[prop]) {
        Object.defineProperty(this, prop, {
          get: getter,
          set: setter,
          enumerable: true,
          configurable: true
        })
      }
    }
  })
}
// instead of polluting the global prototype we create this as an class method instead
export { WatchClass }

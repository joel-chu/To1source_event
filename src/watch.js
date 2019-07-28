// a polyfill to create global watch method
// from https://abdulapopoola.com/2015/04/17/how-to-watch-variables-in-javascript/
// without own modification to make it NOT polluting the global prototype chain
class WatchClass {}

if (!WatchClass.prototype.watch) {
 Object.defineProperty(WatchClass.prototype, "watch", {
     enumerable: false,
     configurable: true,
     writable: false,
     value: function (prop, handler) {
       var old = this[prop];
       var cur = old;
       var getter = function () {
          return cur;
       }
       var setter = function (val) {
        old = cur;
        // We change the order of the params
        cur = handler.call(this, val, prop, old)

        return cur;
       }

       // can't watch constants
       if (delete this[prop]) {
        Object.defineProperty(this,prop,{
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

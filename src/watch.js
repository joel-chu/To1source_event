// a polyfill to create global watch method
// from https://abdulapopoola.com/2015/04/17/how-to-watch-variables-in-javascript/

if (!Object.prototype.watch) {
 Object.defineProperty(Object.prototype, "watch", {
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
        cur = handler.call(this,prop,old,val)

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

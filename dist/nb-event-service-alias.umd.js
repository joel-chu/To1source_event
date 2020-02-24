!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(t=t||self).NBEventService=e()}(this,(function(){"use strict";var t=new WeakMap,e=new WeakMap;var r=function(){this.__suspend__=null,this.queueStore=new Set},o={$suspend:{configurable:!0},$queues:{configurable:!0}};return o.$suspend.set=function(t){var e=this;if("boolean"!=typeof t)throw new Error("$suspend only accept Boolean value!");var r=this.__suspend__;this.__suspend__=t,this.logger("($suspend)","Change from "+r+" --\x3e "+t),!0===r&&!1===t&&setTimeout((function(){e.release()}),1)},r.prototype.$queue=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];return!0===this.__suspend__&&(this.logger("($queue)","added to $queue",t),this.queueStore.add(t)),this.__suspend__},o.$queues.get=function(){var t=this.queueStore.size;return this.logger("($queues)","size: "+t),t>0?Array.from(this.queueStore):[]},r.prototype.release=function(){var t=this,e=this.queueStore.size;if(this.logger("(release)","Release was called "+e),e>0){var r=Array.from(this.queueStore);this.queueStore.clear(),this.logger("queue",r),r.forEach((function(e){t.logger(e),Reflect.apply(t.$trigger,t,e)})),this.logger("Release size "+this.queueStore.size)}},Object.defineProperties(r.prototype,o),function(t){function e(e){void 0===e&&(e={}),t.call(this,e)}return t&&(e.__proto__=t),e.prototype=Object.create(t&&t.prototype),e.prototype.constructor=e,e.prototype.on=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];return Reflect.apply(this.$on,this,t)},e.prototype.off=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];return Reflect.apply(this.$off,this,t)},e.prototype.emit=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];return Reflect.apply(this.$trigger,this,t)},e.prototype.once=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];return Reflect.apply(this.$once,this,t)},e.prototype.only=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];return Reflect.apply(this.$only,this,t)},e.prototype.onlyOnce=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];return Reflect.apply(this.$onlyOnce,this,t)},e.prototype.get=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];return Reflect.apply(this.$get,this,t)},e.prototype.replace=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];return Reflect.apply(this.$replace,this,t)},e}(function(t){function e(e){void 0===e&&(e={}),t.call(this,e)}t&&(e.__proto__=t),e.prototype=Object.create(t&&t.prototype),e.prototype.constructor=e;var r={$done:{configurable:!0}};return e.prototype.logger=function(){},e.prototype.$on=function(t,e,r){var o=this;void 0===r&&(r=null);this.validate(t,e);var n=this.takeFromStore(t);if(!1===n)return this.logger("($on)",t+" callback is not in lazy store"),this.addToNormalStore(t,"on",e,r);this.logger("($on)",t+" found in lazy store");var i=0;return n.forEach((function(n){var a=n[0],l=n[1],s=n[2];if(s&&"on"!==s)throw new Error("You are trying to register an event already been taken by other type: "+s);o.logger("($on)","call run on "+t),o.run(e,a,r||l),i+=o.addToNormalStore(t,"on",e,r||l)})),i},e.prototype.$once=function(t,e,r){void 0===r&&(r=null),this.validate(t,e);var o=this.takeFromStore(t);this.normalStore;if(!1===o)return this.logger("($once)",t+" not in the lazy store"),this.addToNormalStore(t,"once",e,r);this.logger("($once)",o);var n=Array.from(o)[0],i=n[0],a=n[1],l=n[2];if(l&&"once"!==l)throw new Error("You are trying to register an event already been taken by other type: "+l);this.logger("($once)","call run for "+t),this.run(e,i,r||a),this.$off(t)},e.prototype.$only=function(t,e,r){var o=this;void 0===r&&(r=null),this.validate(t,e);var n=!1,i=this.takeFromStore(t);(this.normalStore.has(t)||(this.logger("($only)",t+" add to store"),n=this.addToNormalStore(t,"only",e,r)),!1!==i)&&(this.logger("($only)",t+" found data in lazy store to execute"),Array.from(i).forEach((function(n){var i=n[0],a=n[1],l=n[2];if(l&&"only"!==l)throw new Error("You are trying to register an event already been taken by other type: "+l);o.logger("($only)","call run for "+t),o.run(e,i,r||a)})));return n},e.prototype.$onlyOnce=function(t,e,r){void 0===r&&(r=null),this.validate(t,e);var o=!1,n=this.takeFromStore(t);if(this.normalStore.has(t)||(this.logger("($onlyOnce)",t+" add to store"),o=this.addToNormalStore(t,"onlyOnce",e,r)),!1!==n){this.logger("($onlyOnce)",n);var i=Array.from(n)[0],a=i[0],l=i[1],s=i[2];if(s&&"onlyOnce"!==s)throw new Error("You are trying to register an event already been taken by other type: "+s);this.logger("($onlyOnce)","call run for "+t),this.run(e,a,r||l),this.$off(t)}return o},e.prototype.$replace=function(t,e,r,o){if(void 0===r&&(r=null),void 0===o&&(o="on"),this.validateType(o)){this.$off(t);var n=this["$"+o];return this.logger("($replace)",t,e),Reflect.apply(n,this,[t,e,r])}throw new Error(o+" is not supported!")},e.prototype.$trigger=function(t,e,r,o){void 0===e&&(e=[]),void 0===r&&(r=null),void 0===o&&(o=!1),this.validateEvt(t);var n=0,i=this.normalStore;if(this.logger("($trigger)","normalStore",i),i.has(t)){var a=this.$queue(t,e,r,o);if(this.logger("($trigger)",t,"found; add to queue: ",a),!0===a)return this.logger("($trigger)",t,"not executed. Exit now."),!1;for(var l=Array.from(i.get(t)),s=l.length,u=!1,h=0;h<s;++h){++n;var f=l[h],p=(f[0],f[1]),c=f[2],g=f[3];this.logger("($trigger)","call run for "+t),this.run(p,e,r||c),"once"!==g&&"onlyOnce"!==g||(u=!0)}return u&&i.delete(t),n}return this.addToLazyStore(t,e,r,o),n},e.prototype.$call=function(t,e,r){void 0===e&&(e=!1),void 0===r&&(r=null);var o=this;return function(){for(var n=[],i=arguments.length;i--;)n[i]=arguments[i];var a=[t,n,r,e];return Reflect.apply(o.$trigger,o,a)}},e.prototype.$off=function(t){var e=this;this.validateEvt(t);var r=[this.lazyStore,this.normalStore],o=!1;return r.forEach((function(r){r.has(t)&&(o=!0,e.logger("($off)",t),r.delete(t))})),o},e.prototype.$get=function(t,e){void 0===e&&(e=!1),this.validateEvt(t);var r=this.normalStore;return!!r.has(t)&&Array.from(r.get(t)).map((function(t){if(e)return t;t[0];return t[1]}))},r.$done.set=function(t){this.logger("($done)","value: ",t),this.keep?this.result.push(t):this.result=t},r.$done.get=function(){return this.keep?(this.logger("(get $done)",this.result),this.result[this.result.length-1]):this.result},Object.defineProperties(e.prototype,r),e}(function(r){function o(t){void 0===t&&(t={}),r.call(this),t.logger&&"function"==typeof t.logger&&(this.logger=t.logger),this.keep=t.keep,this.result=t.keep?[]:null,this.normalStore=new Map,this.lazyStore=new Map}r&&(o.__proto__=r),o.prototype=Object.create(r&&r.prototype),o.prototype.constructor=o;var n={is:{configurable:!0},normalStore:{configurable:!0},lazyStore:{configurable:!0}};return n.is.get=function(){return"nb-event-service"},o.prototype.validateEvt=function(){for(var t=this,e=[],r=arguments.length;r--;)e[r]=arguments[r];return e.forEach((function(e){if("string"!=typeof e)throw t.logger("(validateEvt)",e),new Error("event name must be string type!")})),!0},o.prototype.validate=function(t,e){if(this.validateEvt(t)&&"function"==typeof e)return!0;throw new Error("callback required to be function type!")},o.prototype.validateType=function(t){return!!["on","only","once","onlyOnce"].filter((function(e){return t===e})).length},o.prototype.run=function(t,e,r){this.logger("(run)",t,e,r),this.$done=Reflect.apply(t,r,this.toArray(e))},o.prototype.takeFromStore=function(t,e){void 0===e&&(e="lazyStore");var r=this[e];if(r){if(this.logger("(takeFromStore)",e,r),r.has(t)){var o=r.get(t);return this.logger("(takeFromStore)","has "+t,o),r.delete(t),o}return!1}throw new Error(e+" is not supported!")},o.prototype.addToStore=function(t,e){for(var r,o=[],n=arguments.length-2;n-- >0;)o[n]=arguments[n+2];if(t.has(e)?(this.logger("(addToStore)",e+" existed"),r=t.get(e)):(this.logger("(addToStore)","create new Set for "+e),r=new Set),o.length>2)if(Array.isArray(o[0])){var i=o[2];this.checkTypeInLazyStore(e,i)||r.add(o)}else this.checkContentExist(o,r)||(this.logger("(addToStore)","insert new",o),r.add(o));else r.add(o);return t.set(e,r),[t,r.size]},o.prototype.checkContentExist=function(t,e){return!!Array.from(e).filter((function(e){return e[0]===t[0]})).length},o.prototype.checkTypeInStore=function(t,e){this.validateEvt(t,e);var r=this.$get(t,!0);return!1===r||!r.filter((function(t){var r=t[3];return e!==r})).length},o.prototype.checkTypeInLazyStore=function(t,e){this.validateEvt(t,e);var r=this.lazyStore.get(t);return this.logger("(checkTypeInLazyStore)",r),!!r&&!!Array.from(r).filter((function(t){return t[2]!==e})).length},o.prototype.addToNormalStore=function(t,e,r,o){if(void 0===o&&(o=null),this.logger("(addToNormalStore)",t,e,"try to add to normal store"),this.checkTypeInStore(t,e)){this.logger("(addToNormalStore)",e+" can add to "+t+" normal store");var n=this.hashFnToKey(r),i=[this.normalStore,t,n,r,o,e],a=Reflect.apply(this.addToStore,this,i),l=a[0],s=a[1];return this.normalStore=l,s}return!1},o.prototype.addToLazyStore=function(t,e,r,o){void 0===e&&(e=[]),void 0===r&&(r=null),void 0===o&&(o=!1);var n=[this.lazyStore,t,this.toArray(e),r];o&&n.push(o);var i=Reflect.apply(this.addToStore,this,n),a=i[0],l=i[1];return this.lazyStore=a,l},o.prototype.toArray=function(t){return Array.isArray(t)?t:[t]},n.normalStore.set=function(e){t.set(this,e)},n.normalStore.get=function(){return t.get(this)},n.lazyStore.set=function(t){e.set(this,t)},n.lazyStore.get=function(){return e.get(this)},o.prototype.hashFnToKey=function(t){return function(t){return t.split("").reduce((function(t,e){return(t=(t<<5)-t+e.charCodeAt(0))&t}),0)}(t.toString())+""},Object.defineProperties(o.prototype,n),o}(r)))}));
//# sourceMappingURL=nb-event-service-alias.umd.js.map

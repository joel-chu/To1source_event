!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(t=t||self).NBEventService=e()}(this,function(){"use strict";var t=new WeakMap,e=new WeakMap;var r=function(t){void 0===t&&(t={}),t.logger&&"function"==typeof t.logger&&(this.logger=t.logger),this.result=null,this.normalStore=new Map,this.lazyStore=new Map},o={$done:{configurable:!0},normalStore:{configurable:!0},lazyStore:{configurable:!0}};return r.prototype.logger=function(){},r.prototype.$on=function(t,e,r){var o=this;void 0===r&&(r=null);this.validate(t,e);var n=this.takeFromStore(t);if(!1===n)return this.logger("$on",t+" callback is not in lazy store"),this.addToNormalStore(t,"on",e,r);this.logger("$on",t+" found in lazy store");var i=0;return n.forEach(function(n){var a=n[0],l=n[1];o.run(e,a,r||l),i+=o.addToNormalStore(t,"on",e,r||l)}),i},r.prototype.$once=function(t,e,r){void 0===r&&(r=null),this.validate(t,e);var o=this.takeFromStore(t);this.normalStore;if(!1===o)return this.logger("$once",t+" not in the lazy store"),this.addToNormalStore(t,"once",e,r);this.logger("$once",o);var n=Array.from(o)[0],i=n[0],a=n[1];this.run(e,i,r||a),this.$off(t)},r.prototype.$only=function(t,e,r){var o=this;void 0===r&&(r=null),this.validate(t,e);var n=this.takeFromStore(t),i=this.normalStore;if(!1===n){if(this.logger("$only",t+" not in the lazy store"),!i.has(t))return this.logger("$only",t+" add to store"),this.addToNormalStore(t,"only",e,r);this.logger("$only",t+" already existed no longer allow to add new listener")}else{this.logger("$only",t+" found data in lazy store to execute"),Array.from(n).forEach(function(t){var n=t[0],i=t[1];o.run(e,n,r||i)})}},r.prototype.$trigger=function(t,e,r){void 0===e&&(e=[]),void 0===r&&(r=null),this.validateEvt(t);var o=0,n=this.normalStore;if(this.logger("$trigger",n),n.has(t)){this.logger("$trigger",t,"found");for(var i=Array.from(n.get(t)),a=i.length,l=!1,s=0;s<a;++s){o=s;var h=i[s],u=(h[0],h[1]),d=h[2],f=h[3];this.run(u,e,r||d),"once"===f&&(l=!0)}return l&&n.delete(t),o}return this.addToLazyStore(t,e,r),o},r.prototype.$call=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];return this.logger("$call"),Reflect.apply(this.$trigger,this,t)},r.prototype.$off=function(t){this.validateEvt(t);var e=[this.lazyStore,this.normalStore],r=!1;return e.forEach(function(e){e.has(t)&&(r=!0,e.delete(t))}),r},r.prototype.$get=function(t,e){void 0===e&&(e=!1),this.validateEvt(t);var r=this.normalStore;return!!r.has(t)&&Array.from(r.get(t)).map(function(t){if(e)return t;t[0];return t[1]})},o.$done.set=function(t){this.logger("set $done",t),this.result=t},o.$done.get=function(){return this.result},r.prototype.validateEvt=function(t){if("string"==typeof t)return!0;throw new Error("event name must be string type!")},r.prototype.validate=function(t,e){if(this.validateEvt(t)&&"function"==typeof e)return!0;throw new Error("callback required to be function type!")},r.prototype.run=function(t,e,r){this.logger("run",t),this.logger("run",e),this.logger("run",r),this.$done=Reflect.apply(t,r,this.toArray(e))},r.prototype.takeFromStore=function(t,e){void 0===e&&(e="lazyStore");var r=this[e];if(this.logger("takeFromStore",e,r),r.has(t)){var o=r.get(t);return this.logger("takeFromStore",o),r.delete(t),o}return!1},r.prototype.addToStore=function(t,e){for(var r,o=[],n=arguments.length-2;n-- >0;)o[n]=arguments[n+2];return t.has(e)?(this.logger("addToStore",e+" existed"),r=t.get(e)):(this.logger("addToStore","create new Set for "+e),r=new Set),o.length>2?this.checkContentExist(o,r)||(this.logger("addToStore","insert new",o),r.add(o)):r.add(o),t.set(e,r),[t,r.size]},r.prototype.checkContentExist=function(t,e){return!!Array.from(e).filter(function(e){return e[0]===t[0]}).length},r.prototype.checkTypeInStore=function(t,e){this.validateEvt(t),this.validateEvt(e);var r=this.$get(t,!0);return!1===r||!r.filter(function(t){var r=t[3];return e!==r}).length},r.prototype.addToNormalStore=function(t,e,r,o){if(void 0===o&&(o=null),this.logger("addToNormalStore",t,e,"add to normal store"),this.checkTypeInStore(t,e)){this.logger(e+" can add to "+t+" store");var n=this.hashFnToKey(r),i=this.addToStore(this.normalStore,t,n,r,o,e),a=i[0],l=i[1];return this.normalStore=a,l}return!1},r.prototype.addToLazyStore=function(t,e,r){void 0===e&&(e=[]),void 0===r&&(r=null);var o=this.addToStore(this.lazyStore,t,this.toArray(e),r),n=o[0],i=o[1];return this.lazyStore=n,i},r.prototype.toArray=function(t){return Array.isArray(t)?t:[t]},o.normalStore.set=function(e){t.set(this,e)},o.normalStore.get=function(){return t.get(this)},o.lazyStore.set=function(t){e.set(this,t)},o.lazyStore.get=function(){return e.get(this)},r.prototype.hashFnToKey=function(t){return t.toString().split("").reduce(function(t,e){return(t=(t<<5)-t+e.charCodeAt(0))&t},0)+""},Object.defineProperties(r.prototype,o),r});
//# sourceMappingURL=nb-event-service.js.map

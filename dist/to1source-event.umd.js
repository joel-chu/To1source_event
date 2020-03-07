!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(t=t||self).To1sourceEvent=e()}(this,(function(){"use strict";var t="You are trying to register an event already been taken by other type:",e=new WeakMap,r=new WeakMap;function o(t){return t instanceof RegExp}function n(t){return"string"==typeof t}var i=function(){this.__suspend_state__=null,this.__pattern__=null,this.queueStore=new Set},a={$queues:{configurable:!0}};return i.prototype.$suspend=function(){this.logger("---\x3e SUSPEND ALL OPS <---"),this.__suspend__(!0)},i.prototype.$release=function(){this.logger("---\x3e RELEASE SUSPENDED QUEUE <---"),this.__suspend__(!1)},i.prototype.$suspendEvent=function(t){var e=function(t){switch(!0){case!0===o(t):return t;case!0===n(t):return new RegExp(t);default:return!1}}(t);if(o(e))return this.__pattern__=e,this.$suspend();throw new Error('We expect a pattern variable to be string or RegExp, but we got "'+typeof e+'" instead')},i.prototype.$queue=function(t){for(var e=[],r=arguments.length-1;r-- >0;)e[r]=arguments[r+1];if(this.logger("($queue) get called"),!0===this.__suspend_state__){if(o(this.__pattern__)){var n=this.__pattern__.test(t);if(!n)return!1}this.logger("($queue) added to $queue",e),this.queueStore.add([t].concat(e))}return!!this.__suspend_state__},a.$queues.get=function(){var t=this.queueStore.size;return this.logger("($queues)","size: "+t),t>0?Array.from(this.queueStore):[]},i.prototype.__suspend__=function(t){if("boolean"!=typeof t)throw new Error("$suspend only accept Boolean value! we got "+typeof t);var e=this.__suspend_state__;this.__suspend_state__=t,this.logger('($suspend) Change from "'+e+'" --\x3e "'+t+'"'),!0===e&&!1===t&&this.__release__()},i.prototype.__release__=function(){var t=this,e=this.queueStore.size,r=this.__pattern__;if(this.__pattern__=null,this.logger("(release) was called with "+e+(r?' for "'+r+'"':"")+" item"+(e>1?"s":"")),e>0){var o=Array.from(this.queueStore);this.queueStore.clear(),this.logger("(release queue)",o),o.forEach((function(e){t.logger(e),Reflect.apply(t.$trigger,t,e)})),this.logger("Release size "+this.queueStore.size)}return e},Object.defineProperties(i.prototype,a),function(e){function r(t){void 0===t&&(t={}),e.call(this,t)}e&&(r.__proto__=e),r.prototype=Object.create(e&&e.prototype),r.prototype.constructor=r;var o={$name:{configurable:!0},is:{configurable:!0},$done:{configurable:!0}};return r.prototype.logger=function(){},o.$name.get=function(){return"to1source-event"},o.is.get=function(){return this.$name},r.prototype.$on=function(e,r,o){var n=this;void 0===o&&(o=null);this.validate(e,r);var i=this.takeFromStore(e);if(!1===i)return this.logger('($on) "'+e+'" is not in lazy store'),this.addToNormalStore(e,"on",r,o);this.logger("($on) "+e+" found in lazy store");var a=0;return i.forEach((function(i){var s=i[0],l=i[1],u=i[2];if(u&&"on"!==u)throw new Error(t+" "+u);n.logger("($on)",'call run "'+e+'"'),n.run(r,s,o||l),a+=n.addToNormalStore(e,"on",r,o||l)})),this.logger("($on) return size "+a),a},r.prototype.$once=function(e,r,o){void 0===o&&(o=null),this.validate(e,r);var n=this.takeFromStore(e);this.normalStore;if(!1===n)return this.logger('($once) "'+e+'" is not in the lazy store'),this.addToNormalStore(e,"once",r,o);this.logger("($once)",n);var i=Array.from(n)[0],a=i[0],s=i[1],l=i[2];if(l&&"once"!==l)throw new Error(t+" "+l);this.logger("($once)",'call run "'+e+'"'),this.run(r,a,o||s),this.$off(e)},r.prototype.$only=function(e,r,o){var n=this;void 0===o&&(o=null),this.validate(e,r);var i=!1,a=this.takeFromStore(e);(this.normalStore.has(e)||(this.logger('($only) "'+e+'" add to normalStore'),i=this.addToNormalStore(e,"only",r,o)),!1!==a)&&(this.logger('($only) "'+e+'" found data in lazy store to execute'),Array.from(a).forEach((function(i){var a=i[0],s=i[1],l=i[2];if(l&&"only"!==l)throw new Error(t+" "+l);n.logger('($only) call run "'+e+'"'),n.run(r,a,o||s)})));return i},r.prototype.$onlyOnce=function(e,r,o){void 0===o&&(o=null),this.validate(e,r);var n=!1,i=this.takeFromStore(e);if(this.normalStore.has(e)||(this.logger('($onlyOnce) "'+e+'" add to normalStore'),n=this.addToNormalStore(e,"onlyOnce",r,o)),!1!==i){this.logger("($onlyOnce)",i);var a=Array.from(i)[0],s=a[0],l=a[1],u=a[2];if(u&&"onlyOnce"!==u)throw new Error(t+" "+u);this.logger('($onlyOnce) call run "'+e+'"'),this.run(r,s,o||l),this.$off(e)}return n},r.prototype.$replace=function(t,e,r,o){if(void 0===r&&(r=null),void 0===o&&(o="on"),this.validateType(o)){this.$off(t);var n=this["$"+o];return this.logger("($replace)",t,e),Reflect.apply(n,this,[t,e,r])}throw new Error(o+" is not supported!")},r.prototype.$trigger=function(t,e,r,o){void 0===e&&(e=[]),void 0===r&&(r=null),void 0===o&&(o=!1),this.validateEvt(t);var n=0,i=this.normalStore;if(this.logger("($trigger) normalStore",i),i.has(t)){if(this.logger('($trigger) "'+t+'" found'),this.$queue(t,e,r,o))return this.logger('($trigger) Currently suspended "'+t+'" added to queue, nothing executed. Exit now.'),!1;for(var a=Array.from(i.get(t)),s=a.length,l=!1,u=0;u<s;++u){++n;var h=a[u],p=(h[0],h[1]),f=h[2],c=h[3];this.logger("($trigger) call run for "+t),this.run(p,e,r||f),"once"!==c&&"onlyOnce"!==c||(l=!0)}return l&&i.delete(t),n}return this.addToLazyStore(t,e,r,o),n},r.prototype.$call=function(t,e,r){void 0===e&&(e=!1),void 0===r&&(r=null);var o=this;return function(){for(var n=[],i=arguments.length;i--;)n[i]=arguments[i];var a=[t,n,r,e];return Reflect.apply(o.$trigger,o,a)}},r.prototype.$off=function(t){var e=this;return this.validateEvt(t),!![this.lazyStore,this.normalStore].filter((function(e){return e.has(t)})).map((function(r){return e.removeFromStore(t,r)})).length},r.prototype.$get=function(t,e){void 0===e&&(e=!1),this.validateEvt(t);var r=this.normalStore;return this.findFromStore(t,r,e)},o.$done.set=function(t){this.logger("($done) set value: ",t),this.keep?this.result.push(t):this.result=t},o.$done.get=function(){return this.logger("($done) get result:",this.result),this.keep?this.result[this.result.length-1]:this.result},r.prototype.$debug=function(t){var e=this;void 0===t&&(t=null);var r=["lazyStore","normalStore"],o=[this.lazyStore,this.normalStore];o[t]?this.logger(r[t],o[t]):o.map((function(t,o){e.logger(r[o],t)}))},Object.defineProperties(r.prototype,o),r}(function(t){function o(e){void 0===e&&(e={}),t.call(this),e.logger&&"function"==typeof e.logger&&(this.logger=e.logger),this.keep=e.keep,this.result=e.keep?[]:null,this.normalStore=new Map,this.lazyStore=new Map}t&&(o.__proto__=t),o.prototype=Object.create(t&&t.prototype),o.prototype.constructor=o;var i={normalStore:{configurable:!0},lazyStore:{configurable:!0}};return o.prototype.validateEvt=function(){for(var t=this,e=[],r=arguments.length;r--;)e[r]=arguments[r];return e.forEach((function(e){if(!n(e))throw t.logger("(validateEvt)",e),new Error("Event name must be string type! we got "+typeof e)})),!0},o.prototype.validate=function(t,e){if(this.validateEvt(t)&&"function"==typeof e)return!0;throw new Error("callback required to be function type! we got "+typeof e)},o.prototype.validateType=function(t){this.validateEvt(t);return!!["on","only","once","onlyOnce"].filter((function(e){return t===e})).length},o.prototype.run=function(t,e,r){this.logger("(run) callback:",t,"payload:",e,"context:",r),this.$done=Reflect.apply(t,r,this.toArray(e))},o.prototype.takeFromStore=function(t,e){void 0===e&&(e="lazyStore");var r=this[e];if(r){if(this.logger("(takeFromStore)",e,r),r.has(t)){var o=r.get(t);return this.logger('(takeFromStore) has "'+t+'"',o),r.delete(t),o}return!1}throw new Error('"'+e+'" is not supported!')},o.prototype.findFromStore=function(t,e,r){return void 0===r&&(r=!1),!!e.has(t)&&Array.from(e.get(t)).map((function(t){if(r)return t;t[0];return t[1]}))},o.prototype.removeFromStore=function(t,e){return!!e.has(t)&&(this.logger("($off)",t),e.delete(t),!0)},o.prototype.addToStore=function(t,e){for(var r,o=[],n=arguments.length-2;n-- >0;)o[n]=arguments[n+2];if(t.has(e)?(this.logger('(addToStore) "'+e+'" existed'),r=t.get(e)):(this.logger('(addToStore) create new Set for "'+e+'"'),r=new Set),o.length>2)if(Array.isArray(o[0])){var i=o[2];this.checkTypeInLazyStore(e,i)||r.add(o)}else this.checkContentExist(o,r)||(this.logger("(addToStore) insert new",o),r.add(o));else r.add(o);return t.set(e,r),[t,r.size]},o.prototype.checkContentExist=function(t,e){return!!Array.from(e).filter((function(e){return e[0]===t[0]})).length},o.prototype.checkTypeInStore=function(t,e){this.validateEvt(t,e);var r=this.$get(t,!0);return!1===r||!r.filter((function(t){var r=t[3];return e!==r})).length},o.prototype.checkTypeInLazyStore=function(t,e){this.validateEvt(t,e);var r=this.lazyStore.get(t);return this.logger("(checkTypeInLazyStore)",r),!!r&&!!Array.from(r).filter((function(t){return t[2]!==e})).length},o.prototype.addToNormalStore=function(t,e,r,o){if(void 0===o&&(o=null),this.logger('(addToNormalStore) try to add "'+e+'" --\x3e "'+t+'" to normal store'),this.checkTypeInStore(t,e)){this.logger("(addToNormalStore)",'"'+e+'" --\x3e "'+t+'" can add to normal store');var n=this.hashFnToKey(r),i=[this.normalStore,t,n,r,o,e],a=Reflect.apply(this.addToStore,this,i),s=a[0],l=a[1];return this.normalStore=s,l}return!1},o.prototype.addToLazyStore=function(t,e,r,o){void 0===e&&(e=[]),void 0===r&&(r=null),void 0===o&&(o=!1);var n=[this.lazyStore,t,this.toArray(e),r];o&&n.push(o);var i=Reflect.apply(this.addToStore,this,n),a=i[0],s=i[1];return this.lazyStore=a,this.logger("(addToLazyStore) size: "+s),s},o.prototype.toArray=function(t){return Array.isArray(t)?t:[t]},i.normalStore.set=function(t){e.set(this,t)},i.normalStore.get=function(){return e.get(this)},i.lazyStore.set=function(t){r.set(this,t)},i.lazyStore.get=function(){return r.get(this)},o.prototype.hashFnToKey=function(t){return function(t){return t.split("").reduce((function(t,e){return(t=(t<<5)-t+e.charCodeAt(0))&t}),0)}(t.toString())+""},Object.defineProperties(o.prototype,i),o}(i))}));
//# sourceMappingURL=to1source-event.umd.js.map

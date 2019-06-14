'use strict';
/**
 * nb-event-service ES6 version rewrite
 * This version will be using the hash key to track the callback to avoid
 * the multiple calling the same function over and over again.
 * that raise another question, what if multiple function bind to the same event
 * using the same callback but at different point?
 */
import genHaskKey from './hash-code.js';

const __NB_EVENT_SERVICE_PRIVATE_STORE__ = new WeakMap();

const __NB_EVENT_SERVICE_PRIVATE_LAZY__ = new WeakMap();

export default class NBEventServiceCls {
    /**
     * class constructor
     */
    constructor(config = {}) {
      if (config.logger && typeof config.logger === 'function') {
        this.logger = config.logger;
      }
    }

    /**
     * logger for overwrite
     */
    logger() {}

    //////////////////////////
    //    PUBLIC METHODS    //
    //////////////////////////
    /**
     * Register your evt handler, note we don't check the type here,
     * we expect you to be sensible and know what you are doing.
     * @param {string} evt name of event
     * @param {function} callback bind method
     * @param {object} context to execute this call in
     * @return {boolean} result add or not
     */
    $on(evt , callback , context)
    {
        const [hashKey , store] = this.__prepare__(evt , callback);
        // should look at the lazyStore first !!!!
        if (this.__executeLazyStore__(evt , callback , context , hashKey) === false) {
            // start with normal empty
            if (!store[evt]) {
                const payload = [this.__constructToStore__(hashKey , callback , context)];
                this.__normalStore__ = this.__merge__(store , evt , payload);
                this.logger('init store' , evt , payload);
                return true;
            }
            else if (!this.__find__(store[evt] , hashKey)) {  // already existed
                // if this hashKey is not registered
                store[evt].push(this.__constructToStore__(hashKey , callback , context))
                this.__normalStore__ = store;
                this.logger('append to store' , payload);
                return true;
            }
        }
        return false;
    }
    /**
     * once only registered it once, there is no overwrite option here
     * @param {string} evt name
     * @param {function} callback to execute
     * @return {boolean} result
     */
    $once(evt , callback , context)
    {
        const [hashKey , store] = this.__prepare__(evt , callback);
        // again this could create a problem if this already register in lazy store
        // then someone else try to register with a normal on
        if (this.__executeLazyStore__(evt , callback , context , hashKey) === false) {
            // if it's already registered, we skip it.
            if (!store[evt]) {
                const normalStore = this.__normalStore__;
                // @TODO this might create problem later on
                const obj = [this.__constructToStore__(hashKey , callback , context)];
                this.__normalStore__ = this.__merge__(normalStore , evt , obj);
                return true;
            }
        }
        return false;
    }
    /**
     * trigger the event
     * @param {string} evts name
     * @param {mixed} params pass to fn
     * @param {object} context overwrite what stored
     * @return {boolean} found or not
     */
    $trigger(evts , params , context)
    {
        const store = this.__normalStore__;
        evts = Array.isArray(evts) ? evts : [evts];
        evts.forEach( (evt) =>
        {
            if (!store[evt]) { // not registered in normal store
                this.logger('not registered put this in lazy store' , evt);
                // TODO this is a bit confusing here
                let lazyStore = this.__lazyStore__;
                params = Array.isArray(params) ? params : [params];
                if (lazyStore[evt]) {
                    lazyStore[evt].push(params);
                }
                else {
                    lazyStore[evt] = [params];
                }
                this.__lazyStore__ = lazyStore;
                return false;
            }
            else {
                store[evt].forEach( (config) =>
                {
                    params = Array.isArray(params) ? params : [params];
                    const [hashKey , _config] = config;
                    _config.fn.apply(context || _config.context , params);
                });
            }
        });
    }
    /**
     * remove the evt from normal store
     * @param {string} evt name
     * @return {boolean} result
     */
    $off(evt)
    {
        const store = this.__normalStore__;
        if (store[evt]) {
            if (Reflect.deleteProperty(store , evt)) {
                this.__normalStore__ = store;
                return true;
            }
        }
        return false;
    }
    /**
     * @return {object} store just return it
     */
    get $store()
    {
        return this.__normalStore__;
    }
    /**
     * This will be search the lazy store if found store in the normal store
     * then convert the lazy store to the normal one here, and immediate execute
     * the action
     * @param {string} evt name
     * @param {function} callback function
     * @param {object} context to excute in
     * @param {string} hashKey of the function
     * @return {mixed} whathappened
     */
    __executeLazyStore__(evt , callback , context , hashKey)
    {
        const lazyStore = this.__lazyStore__;
        if (lazyStore[evt]) { // only when this been registered in lazy store
            lazyStore[evt].forEach( function(params)
            {
                callback.apply(context , params);
            });
            // convert the lazy store to normal store
            const normalStore = this.__normalStore__;
            const obj = [this.__constructToStore__(hashKey , callback , context)];
            this.__normalStore__ = this.__merge__(normalStore , evt , obj);
            // remove from the lazy store
            if (Reflect.deleteProperty(lazyStore , evt)) {
                this.__lazyStore__ = lazyStore;
            }
            return true;
        }
        return false; // just null because nothing happen
    }
    /**
     * our own merge method
     * @param {object} store the store to merge
     * @param {string} key to add
     * @param {mixed} value to add
     * @return {object} store the newly defined store
     */
    __merge__(store , key , value)
    {
        store[key] = value;
        // this.logger('check key value' , key , value);
        return store;
    }
    /**
     * shorthand to save to store store
     * @param {object} obj to store
     * @return {undefined} none
     */
    set __normalStore__(obj)
    {
        __NB_EVENT_SERVICE_PRIVATE_STORE__.set(this , obj);
    }
    /**
     * @return {object} store store
     */
    get __normalStore__()
    {
        return __NB_EVENT_SERVICE_PRIVATE_STORE__.get(this) || {};
    }
    /**
     * @param {object} obj to store
     * @return {undefined} none
     */
    set __lazyStore__(obj)
    {
        __NB_EVENT_SERVICE_PRIVATE_LAZY__.set(this , obj);
    }
    /**
     * @return {object} store
     */
    get __lazyStore__()
    {
        return __NB_EVENT_SERVICE_PRIVATE_LAZY__.get(this) || {};
    }

    /**
     * @param {string} evt name
     * @param {function} callback to store
     * @param {string} key type of store
     * @return {turple} result hashKey , store
     */
    __prepare__(evt , callback , key = 'store')
    {
        if (typeof evt !== 'string') {
            throw 'Expect evt to be string';
        }
        const fn = key === 'store' ? 'normalStore' : 'lazyStore';
        // create a hash code and check if this already been stored
        const store = this['__' + fn + '__'];
        const hashKey = this.__hashCode__(callback);
        return [hashKey , store];
    }
    /**
     * @param {string} key hash
     * @param {function} callback to store
     * @param {object} context to exeucte it
     * @return {object} result
     */
    __constructToStore__(key , callback , context = null)
    {
        return [key , {
            fn: callback ,
            context: context
        }];
    }
    /**
     * @param {object} store the event store
     * @param {string} key hash
     */
    __find__(store , key)
    {
        return !!store.filter( (s) =>
        {
            const [hash,] = s;
            return hash === key;
        }).length;
    }
    /**
     * generate a hashKey to identify the function call
     * @param {function} fn the converted to string function
     * @return {string} hashKey
     */
    __hashCode__(fn)
    {
        return genHaskKey(fn.toString())
    }
}

// -- EOF --

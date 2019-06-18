# nb-event-service

> A universal Event Service for Javascript.

## Installation

    $ npm install nb-event-service --save

This module works in browser as well as node.js
The main different between this module and the other event emitter out there is this:

**We don't care about the order of event registration and handling**

Basically you can trigger an event that doesn't exist (well, sort of, its magic)

For example:

```js
//  other library like EventEmitter

ee.emitEvent('someEvent')

ee.addListener('someEvent', function() {
  console.log('I am called')
})

```

The callback in the above example never works and you will never see the message. But our can do it:

```js
es.$trigger('someEvent') // <-- not yet exist

ee.$on('someEvent', function() {
  console.log('Hello world!')
})
```

The message will show.

*Please note the new version is using ES6 features heavily (WeakMap, Set, Map, Array.from etc) if you need to
use this module on older platform, please provide polyfill accordingly*

## API

#### $on(eventName, callback, context)

* eventName (string) The event name you want to handle. You can call this multiple times to add different listeners
* callback (function) it will receive the `params` that call
* context (object|null) optional, we will pass it like this `Reflect.apply(callback, context, args)`

It will return the total number of events that get registered.

#### $once(eventName , callback, context)

* eventName (string) the event you want to listen to once, you can call this more than once to add more listener
* callback (function) it will receive the `params` that call
* context (object|null) optional same as above

$once allow you to bind one or more listener to the same event. But once this event fired (triggered)
it will remove itself from the event store, and no longer available. This behavior is changed in V1.3.0.

There is a potential problem with $once you can see below. It's no really a bug per se, but due to our
own unique feature that can call event before even it existed (yeah, it's magic)


```js
// trigger event before it register with a handler
ee.$trigger('someEvent')
// now it register with a regular $on
ee.$on('someEvent', function() {
  console.log('call me second')
})
// but some where else you try to register it with $once
ee.$once('someEvent', function() {
  console.log('call me first')
})
```

In v1.3.0 we change the behavior of $once, now you can register more than one handler.
But if you look at the above example, you register it with `$on` then `$once`.

What happen is, the `$once` call execute the `$trigger` from the earlier call, then it will
remove this event from the event handler store. Therefore, you `$on` will never fire again.

So you have to make sure which event you **REALLY** want to register with what.

#### $only(eventName , callback, context)

This is a new method in v1.3.0

* eventName (string) the event you want to listen to once, this is first come first serve, and only **ONE** listener
* callback (function) it will receive the `params` that call
* context (object|null) optional same as above

Example:

```js
$only('only-event', function(message) {
  console.log('ONLY', message)
})
// now if you try to add another
$only('only-event', function(message) {
  console.log('AGAIN', message)
})

// execute it
$call('only-event', 'A little cat jumping through the window')

```

You will only get `ONLY A little cat jumping through the window` but the second callback never add to the event store.
Although we develop this feature purposely for our other library to use, but it has a lot real world usage.

### $onlyOnce(eventName , callback, context)

Just like what it said on the tin; its `$only` + `$once`. You should able to figure out what it does.

#### $off(eventName)

* eventName (string) event to remove from internal store  

It will return

* true - event been clear
* false - such even doesn't exist

#### $trigger(eventName, params , context)

* eventName (string) this will trigger the callback that register with this `eventName` whether that actually exist or not
* params (mixed) optional - data you want to pass to your callback method
* context (object || null) optional - When we execute the callback, we will add this context to the `Reflect.apply` or default to null

This method will return

* false - if there is nothing to call
* i - the total events been called

#### $call

This is an alias to `$trigger`

#### $get(evt)

* return all the listeners for that particular event name from the internal store. Handy for debug.

Or it will return `false` if there is nothing

## Alias version

If you don't like the `$`, you can use the alias version.

For browser you can include the `nb-event-service/dist/alias.js` for node you can `require('nb-event-service/alias')`

And that will gives you the following alias version:

- on --> $on
- once --> $once
- off --> $off
- emit --> $trigger
- get --> $get
- only --> $only
- onlyOnce --> $onlyOnce

## $done getter

This is a feature that you don't see in other Event Emitter library.

Whenever you execute the callback, the result will store in the internal `$done` setter.

So you can call the `$done` getter to get back the last result.

Example:

```js
es.$on('add', function add(val) {
  return val + 1;
})

es.$trigger('add', 1000)

console.log(es.$done)

```

You will get a 1001. This might be useful in some situation. Please note, it will get call
whenever a event got trigger, if at the same time some other event trigger then your value
might be different from what you expected. So use this with caution.

## Examples

Coming soon with more update to date example.

## Test

```sh
$ npm test  
```

We use ava for testing

## Build

```sh
$ npm run build
```

It will kick start the rollup building process

---

ISC

[Joel Chu](https://joelchu.com) [NEWBRAN LTD](https://newbran.ch) (c) 2019

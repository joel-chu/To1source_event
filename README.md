# @to1source/event

> An universal Event Emitter / Bus for Javascript.

This package was [nb-event-service](https://npmjs.com/package/nb-event-service) and now we move under [@to1source/event](https://www.npmjs.com/package/@to1source/event) namespace to continue the development.  

## Installation

```sh
    $ npm install @to1source/event
```

This module works in browser as well as node.js.

The main different between this module and the other event emitter out there is this:

> We don't care about the order of event registration and handling

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
es.$trigger('someEvent', 'Hello world!') // <-- not yet exist

ee.$on('someEvent', function(msg) {
  console.log(msg)
})
```

The message will show.

*Please note the module is using ES6+ (WeakMap, Set, Map, Array.from etc).
When you use this module on older browser, please provide polyfill accordingly*

When you include this module in browser (using our stock build). You will get a `To1sourceEvent` global object:

```html
<script>
  var event = new To1sourceEvent()
  // then do your thing
</script>
```

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

`$once` allow you to bind one or more listener to the same event. But once this event fired (triggered)
it will remove itself from the event store, and no longer available. This behavior is changed in V1.3.0.

There is a potential problem with `$once` you can see below. It's not really a bug per se, but due to our
own unique feature that can call event before it existed (yeah, it's kinda magic)


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

In v1.3.0 we change the behavior of `$once`, now you can register more than one handler.
But if you look at the above example, you register it with `$on` then `$once`.

What happen is, the `$once` call execute by the `$trigger` from the earlier call, then it will
remove this event from the event handler store. Therefore, your `$on` will never fire again.

So you have to make sure which event you **REALLY** want to register with what.

#### $only(eventName , callback, context)

This is a new method in v1.3.0

* eventName (string) the event you want to listen to once, this is first come first serve, and only **ONE** listener
* callback (function) it will receive the `params` that call
* context (object|null) optional same as above

Example:

```js
es.$only('only-event', function(message) {
  console.log('ONLY', message)
})
// now if you try to add another
es.$only('only-event', function(message) {
  console.log('AGAIN', message)
})

// execute it
es.$trigger('only-event', 'A little cat jumping through the window')

```

You will only get `ONLY A little cat jumping through the window` but the second callback never add to the event store.
Although we develop this feature purposely for our other library to use, but it has a lot real world usage.

#### $onlyOnce(eventName , callback, context)

Just like what it said on the tin; its `$only` + `$once`. You should able to figure out what it does.

#### $off(eventName)

* eventName (string) event to remove from internal store  

It will return

* true - event been clear
* false - such event doesn't exist

#### $replace(eventName, callback, context = null, type = 'on')

This is `$off` + event register function

Type can be `on`, `only`, `once`, `onlyOnce` default value is `on`

#### $trigger(eventName, params , context, type)

* eventName (string) this will trigger the callback that register with this `eventName` whether that actually exist or not
* params (mixed) optional - data you want to pass to your callback method
* context (object || null) optional - When we execute the callback, we will add this context to the `Reflect.apply` or default to null
* type (string) available types are `on`, `only`, `once`, `onlyOnce` this is for trigger event before it get register and prevent other type to register it

This method will return:

* false - if there is nothing to call
* i - the total number of event been called

#### $call(eventName, type, context) => (...params)

It takes three parameter then return a function to accept the parameters

* eventName (string) this will trigger the callback that register with this `eventName` whether that actually exist or not
* type (string) optional - available types are `on`, `only`, `once`, `onlyOnce` this is for trigger event before it get register and prevent other type to register it
* context (object || null) optional - When we execute the callback, we will add this context to the `Reflect.apply` or default to null

Then the return function will accept parameter as spread. Internally it calls `$trigger`, but the return function accept parameter as spread
to prevent an edge case, when you only have one parameter but it's an array. The spread will make sure it's an array of any type (in the edge case it will be array of an array) and the data will pass to the call back correctly.

Example:

```js
// call before event register
es.$call('some-event', 'only')([1001]) // note the function call
// now try to register it with a different event handler
es.$on('some-event', function(nums) {
  return ++num[0]
})
// it will throw Error that tells you it has been register with `only` type already
```

#### $get(evt)

It returns all the listeners for that particular event name from the internal store. Handy for debug.

Or it will return `false` if there is nothing

#### $suspend + $release

We have a `suspend state`, and watch this property internally, when you set this to true, we suspend all the `$trigger` and `$call` action.
Then when you set this to false, all the previous suspended call(s) will get release (execute).

```js
const evtSrv = new To1sourceEvent()

evtSrv.$on('some-event', value => {
  return value + 1
})

evtSrv.$suspend()

evtSrv.$trigger('some-event', 100)
// what happen inside
console.log(evtSrv.$done) // null

evtSrv.$release()
// what happen now
console.log(evtSrv.$done) // 101

```

#### $suspendEvent(eventPattern)

This is similar to `$suspend`, but it allows you to provide an event name pattern to those event name that matches.

```js

$on('some-event-ok', () => {
  console.log('ok')
})

$on('some-event-not-great', () => {
  console.log('Not great!')
})
// @NOTE you can pass the entire event name or just part that can match
$suspendEvent(`-not-great`)
// or pass an RegExp object
$suspendEvent(/\-not-great/) // note the second call will overwrite the first one

$trigger('some-event-ok')
$trigger('some-event-not-great')

// $release() --> when you can $release, the previous block event will get executed

```

In the above example, only the `some-event-ok` will get triggered.

#### $debug(idx)

This method only logging output, so make sure you have pass a logger when init the object.

- 0 lazyStore
- 1 normalStore

If you don't pass anything, it will log all the stores to show what is inside.

## Alias version

If you don't like the `$`, you can use the alias version.

For browser you can include the `dist/to1source-event-alias.js`, for ES6 `import To1sourceEvent from '@to1source/event/alias'`
for node you can `require('@tosource/event/dist/alias')`

And that will gives you the following alias version:

- on --> $on
- once --> $once
- off --> $off
- emit --> $trigger
- get --> $get
- only --> $only
- onlyOnce --> $onlyOnce
- replace --> $replace

If you want everything alias, then roll your own by extending this class

```js
// node
import To1sourceEvent from '@to1source/event/alias'

class MyEventClass extends To1sourceEvent {
  constructor(config) {
    super(config)
  }

  // you can overwrite the $name getter to give yourself a new name
  get $name() {
    return 'roll-my-own-event-class'
  }

  // then do more of your alias
  // example
  suspend() {
    return this.$suspend()
  }
}

```

## $done getter

This is a feature that you don't see in other Event Emitter library.

Whenever you execute the callback, the result will store in the internal `$done` setter.

So you can call the `$done` getter to get back the last result.

Example:

```js
es.$on('add', function add(val) {
  return val + 1
})

es.$trigger('add', 1000)

console.log(es.$done)

```

You will get a 1001. This might be useful in some situation. Please note, it will get call
whenever a event got trigger, if at the same time some other event trigger then your value
might be different from what you expected. So use this with caution.

## Test

We use [ava](https://github.com/avajs/ava) for testing.

```sh
$ npm test  
```

## Build

We use [rollup](https://rollupjs.org/guide/en/) for building process.

```sh
$ npm run build
```

---

ISC

[Joel Chu](https://joelchu.com) [NEWBRAN LTD](https://newbran.ch) (c) 2020

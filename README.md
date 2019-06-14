# nb-event-service

> An universal Event Service for Javascript.

## Installation

    $ npm install nb-event-service --save

This module works in browser as well as node.js

## API

#### $on(eventName, callback)

* eventName (string || array) now you can pass one, or many (array) to listen to multiple events.
* callback (function) it will receive the `params` that call a second `from` see below for more info.

It will return the total number of events that get registered.

#### $once(eventName , callback)

* eventName (string || array) now you can pass one, or many (array) to listen to multiple events.
* callback (function) it will receive the `params` that call a second `from` see below for more info.

There was a problem when I use it in Angular whenever a page
get reloaded - the same event listener get register then accumulated
and fire all at once, I ended up have to do a $off before calling $on
now this will solve the problem, that make sure it only bind the event once

#### $off(eventName)

* eventName (string) event to remove from internal store  

It will return

* true - event been clear
* false - such even doesn't exist

#### $trigger(eventName , params , context)

* eventName (string || array) you can trigger one or multiple events (array)
* params (mixed) data you want to pass to your callback method
* When we execute the callback, we will add this context to the `Reflect.apply` or default to null

This method will return

* false - if there is nothing to call
* i - the total events been called

#### $get(evt)

* return all the listerners for that particular event name from the internal store. Handy for debug.

#### $call

This is an alias to `$trigger`

## Examples

Then register your event with a handler:

```js
    EventSrvInstance.$on('someEventName' , function(data)
    {
        // do what you want
    })
```

Now fire at will:

```js
    EventSrvInstance.$trigger('someEventName', {data: 'some data'});
```

Now use this with AngularJS, create a service / provider (but not a factory!)

```javascript
    angular.module('yourAppModule').service('MyEventService' , NBEventService);
```

Or if you want to pass an option:

```javascript

    angular.module('yourAppModule').service('MyEventService' , function()
    {
        var srv = this;
        srv = angular.extend(srv , new window.NBEventService['default']({
            logger: console.log
        }));
        return srv;
    })

```


And that's it. Let say you register the event in your controller as well as a directive

Controller:

```js
    angular.module('yourAppModule').controller('mainCtrl' , ['$scope' , 'MyEventService', function($scope , MyEventService)
    {
        MyEventService.$on('someClickEvent' , function(data , from)
        {
            // then do some data processing with the data
            // a handy thing is if you have pass the `from` param when you call the `$trigger`
            // you can use it to control the flow whether you want to do anything with it.
            switch(from) {
                case FIRE_FORM_LEFT:
                    do_left();
                break;
                case FIRE_FROM_RIGHT:
                    do_right();
                break;
            }
        });
    }]);
```

In a directive some where else

```js
    angular.module('yourAppModule').directive('showHideMe' , ['MyEventService' , function(MyEventService)
    {
        var tpl = [
            '<div ng-show="showMe">',
            '{{showMeData}}',
            '</div>'
        ].join('');

        return {
            restrict: 'E',
            template: tpl,
            link: function(scope , el , attr)
            {
                MyEventService.$on('someClickEvent' , function(data)
                {
                    scope.showMe = true;
                    scope.showMeData = data;
                }, 'clicked');
            }
        }
    }]);
```


Then somewhere else in another directive

```js
    angular.module('yourAppModule').directive('clickMe' , ['MyEventService' , function(MyEventService)
    {
        return {
            restrict: 'A',
            link: function(scope , el , attr)
            {

                el.on('click' , function(evt)
                {
                    evt.preventDefault();

                    MyEventService.$trigger('someClickEvent' , {clicker: 'clickMe Directive'} , 'another-click');

                });
            }
        }
    }]);
```

If you want to wrap this around your own service

```js

    angular.module('yourAppModule').service('yourService' , [function()
    {
        var self = angular.merge(this , new NBEventService());
        // the rest of the stuff you want to do

        return self;
    }]);
```

And you can use this with React.js / Riot.js (or any other JS library) pretty easily.

### ~~Loading sequence and timing might cause problem~~

**This is not a problem anymore.**

V0.3.0 - add `lazyStore` internally, so you could `$trigger` before you register the listener.

V0.5.3 - change the way how the object init. We now allow you to pass an config object during init

    new NBEventService({logger: console.log});

Then you can see all the internal what is happening. Also fix a bug which about the context, now by default will be a `null` value
instead of `this`

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

(Joel Chu)[https://newbran.ch] (c) 2019

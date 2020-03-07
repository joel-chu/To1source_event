const test = require('ava')
// import the cjs version for testing
const NBEventService = require('../dist/to1source-event.cjs')
const logger = require('debug')('nb-event-service')
const debug  = require('debug')('nb-event-service:test:basic')
let value = 1000

test.before( t => {
  t.context.evtSrv = new NBEventService({
    logger
  })
})

test(`Should have a is getter`, t => {

  t.is('nb-event-service', t.context.evtSrv.is)
})

test('It should able to validate the evt', t => {
  let evtSrv = t.context.evtSrv
  let fn = (...args) => Reflect.apply(evtSrv.$on, evtSrv, args)
  t.throws(() => fn('some', false) , /*new Error()*/ null, 'Should throw error because callback is not a function')
})

test.cb('It should able to bind a simple test and callback', t => {
  t.plan(1)
  let evtName = 'simple'
  t.context.evtSrv.$on(evtName, function(num) {
    t.is(num, value)
    t.end()
  })
  t.context.evtSrv.$trigger(evtName, value)
})

test.cb('It should able to emit the event before register the listener', t => {
  t.plan(1)
  let evtName = 'simple-reverse'

  t.context.evtSrv.$trigger(evtName, value)

  t.context.evtSrv.$on(evtName, function(num) {
    t.is(num, value)
    t.end()
  })
})

test.cb('It should able to add more than one listerner to the same event', t => {
  t.plan(2)

  let evtName = 'multiple'
  let letter = 'again'

  t.context.evtSrv.$on(evtName, function(a) {
    t.is(a , letter)
  })

  t.context.evtSrv.$on(evtName, function(b) {
    t.is(b, letter)
    t.end()
  })

  t.context.evtSrv.$trigger(evtName, letter)

})

test('It should not allow to add the same function again', t => {
  let evtName = 'add-once'
  const callback = (x) => {
    debug(x)
  }

  t.context.evtSrv.$on(evtName, callback)
  t.context.evtSrv.$on(evtName, callback)

  let ctn = t.context.evtSrv.$get(evtName)

  t.is(ctn.length, 1)
})

test('It should only call once if we use the $once option', t => {
  let evtName = 'once-call'
  let ctn0 = 0

  debug(evtName, ctn0)

  const callback0 = () => {
    ++ctn0
    debug(ctn0)
  return ctn0
  }

  const callback2 = () => {
    ++ctn0
    debug(ctn0)
  return ctn0
  }

  t.context.evtSrv.$once(evtName, callback0)
  t.context.evtSrv.$once(evtName, callback2)

  t.context.evtSrv.$trigger(evtName)
  t.context.evtSrv.$trigger(evtName)

  t.is(ctn0, 1)

})

test('Using the $call alias to $trigger should do the same thing', t => {
  let evtName = 'alias'
  let ctn1 = 0

  const callback = () => {
    ++ctn1
    debug(ctn1)
    return ctn1
  }
  t.context.evtSrv.$once(evtName, callback)
  t.context.evtSrv.$trigger(evtName)
  t.context.evtSrv.$call(evtName)()

  t.is(ctn1, 1)
})

test('Using $trigger and $call should make the callback run again', t => {
  let evtName = 'alias-two'
  let ctn2 = 0

  const callback = () => {
    ++ctn2
    debug(ctn2)
    return ctn2
  }

  t.context.evtSrv.$trigger(evtName)
  t.context.evtSrv.$call(evtName)()

  t.context.evtSrv.$on(evtName, callback)

  t.is(ctn2, 2)

})

test('Should not able to call the method once the $off is called', t => {

  let evtName = 'off-event'

  const callback = (l) => {
    debug(`${l}`)
  }

  t.context.evtSrv.$on(evtName, callback)

  t.context.evtSrv.$off(evtName)

  t.context.evtSrv.$trigger(evtName)

  t.false(t.context.evtSrv.$get(evtName))

})

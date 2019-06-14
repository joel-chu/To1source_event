const test = require('ava')
// import the cjs version for testing
const NBEventService = require('../main')
const debug = require('debug')('nb-event-service')


let value = 1000;

test.before( t => {
  t.context.evtSrv = new NBEventService({
    logger: debug
  })
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

test.only('It should not allow to add the same function again', t => {
  let evtName = 'add-once'
  const callback = (x) => {
    debug(x)
  }

  t.context.evtSrv.$on(evtName, callback)
  t.context.evtSrv.$on(evtName, callback)

  let ctn = t.context.evtSrv.$get(evtName)

  t.is(ctn.length, 1)

})

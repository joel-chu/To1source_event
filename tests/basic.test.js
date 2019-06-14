const test = require('ava')
// import the cjs version for testing
const NBEventService = require('../main')
const debug = require('debug')('nb-event-service')


let value = 1000;

test.before( t => {
  t.context.evtSrv = new NBEventService.default({
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

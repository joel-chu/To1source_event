const test = require('ava')
// import the cjs version for testing
const NBEventService = require('../main')
const debug = require('debug')('nb-event-service')

debug(NBEventService)

test.before( t => {
  t.context.evtSrv = new NBEventService.default({
    logger: debug
  })
})

test.cb('It should able to bind a simple test and callback', t => {

  t.plan(1)

  let evtName = 'simple'
  let value = 1000;

  t.context.evtSrv.$on(evtName, function(num) {
    t.is(num, value)
    t.end()
  })

  t.context.evtSrv.$trigger(evtName, value)

})

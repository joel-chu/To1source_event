const test = require('ava')

const NBEventService = require('../main')
const logger = require('debug')('nb-event-service')
const debug  = require('debug')('nb-event-service:test:only-problem')
let value = 1000;

test.before( t => {
  t.context.evtSrv = new NBEventService({
    logger
  })
})

test('Test the check type method', t => {

  let evt = 'test-evt'
  let evtSrv = t.context.evtSrv;

  t.is(evtSrv.checkTypeInStore(evt, 'on'), true)

  evtSrv.$on(evt, function() {
    debug('call me')
  })

  t.is(evtSrv.checkTypeInStore(evt, 'on'), true)

  evtSrv.$on(evt, function() {
    debug('call me again')
  })
  
  t.is(evtSrv.checkTypeInStore(evt, 'only'), false)


})

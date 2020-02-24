const test = require('ava')

const NBEventService =  require('../dist/nb-event-service.cjs')
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

test('only should only allow to add one listner', t => {
  let evt = 'test-only-evt'
  let evtSrv = t.context.evtSrv;
  evtSrv.$only(evt, function(num) {
    return num + 10;
  })
  evtSrv.$only(evt, function(num) {
    return num * 10;
  })
  evtSrv.$call(evt)(100)
  t.is(evtSrv.$done, 110)
})

test('Test the trigger before call $only and see if that works the same', t => {
  let ctn = 0;
  let evt = 'test-only-reverse'
  let evtSrv = t.context.evtSrv;

  evtSrv.$call(evt)('x')

  let result1 = evtSrv.$only(evt, function(A) {
    debug(A, ctn)
    return ++ctn;
  })

  t.truthy(result1)

  evtSrv.$call(evt)('y')

  let result2 = evtSrv.$only(evt, function(B) {
    debug(B, ctn)
    return --ctn;
  })

  t.false(result2)

  t.is(evtSrv.$done , 2)

})

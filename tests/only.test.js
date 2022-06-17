const test = require('ava')

const To1sourceEvent =  require('../dist/to1source-event.cjs')
const logger = require('debug')('to1source-event')
const debug  = require('debug')('to1source-event:test:only-problem')
let value = 1000;

test.before( t => {
  t.context.evtSrv = new To1sourceEvent({
    logger
  })
})

test('Test the check type method', t => {

  const evt = 'test-evt'
  const evtSrv = t.context.evtSrv

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
  const evt = 'test-only-evt'
  const evtSrv = t.context.evtSrv
  
  evtSrv.$only(evt, function(num) {
    return num + 10
  })
  evtSrv.$only(evt, function(num) {
    return num * 10
  })
  evtSrv.$call(evt)(100)
  t.is(evtSrv.$done, 110)
})

test('Test the trigger before call $only and see if that works the same', t => {
  let ctn = 0;
  const evt = 'test-only-reverse'
  const evtSrv = t.context.evtSrv;

  evtSrv.$call(evt)('x')

  let result1 = evtSrv.$only(evt, function(A) {
    debug(A, ctn)
    return ++ctn
  })

  t.truthy(result1)

  evtSrv.$call(evt)('y')

  let result2 = evtSrv.$only(evt, function(B) {
    debug(B, ctn)
    return --ctn
  })

  t.false(result2)

  t.is(evtSrv.$done , 2)

})

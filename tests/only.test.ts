import test from 'ava'

import To1SourceEvent from '../src'
import { StoresClass } from '../src/stores'
import debug from 'debug'

const logger = debug('to1source-event')
const _debug = debug('to1source-event:test:only-problem')

// let value = 1000

const evtSrv = new To1SourceEvent({ logger })

// we don't expose those methods anymore need to find a different way to test it
test.skip('Test the check type method', t => {
  const storesCls = new StoresClass({ logger })
  const evt = 'test-evt'

  t.is(storesCls.checkTypeInStore(evt, 'on'), true)

  evtSrv.$on(evt, function () {
    _debug('call me')
  })

  t.is(storesCls.checkTypeInStore(evt, 'on'), true)

  evtSrv.$on(evt, function () {
    _debug('call me again')
  })

  t.is(storesCls.checkTypeInStore(evt, 'only'), false)
})

test('only should only allow to add one listner', t => {
  const evt = 'test-only-evt'
  evtSrv.$only(evt, function (num: number) {
    return num + 10
  })
  evtSrv.$only(evt, function (num: number) {
    return num * 10
  })
  evtSrv.$call(evt)(100)
  t.is(evtSrv.$done, 110)
})

test('Test the trigger before call $only and see if that works the same', t => {
  let ctn = 0
  const evt = 'test-only-reverse'

  evtSrv.$call(evt)('x')

  let result1 = evtSrv.$only(evt, function (A: string) {
    _debug(A, ctn)
    return ++ctn
  })

  t.truthy(result1)

  evtSrv.$call(evt)('y')

  let result2 = evtSrv.$only(evt, function (B: string) {
    _debug(B, ctn)
    return --ctn
  })

  t.false(result2)

  t.is(evtSrv.$done , 2)

})

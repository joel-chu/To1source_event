import test from 'ava'
import To1SourceEvent from '../src'
import { StoresClass } from '../src/stores'
import debug from 'debug'

const logger = debug('to1source-event:test:on-max')

test('Test the max count store with StoreClass', t => {
  const storeCls = new StoresClass({ logger })
  const evtName = 'max-store-test'

  const max1 = storeCls.checkMaxStore(evtName, 3)
  t.is(max1, 3, 'Should return the init max value')

  const max2 = storeCls.checkMaxStore(evtName)
  t.is(max2, 2)

  const max3 = storeCls.checkMaxStore(evtName)
  t.is(max3, 1)

  const max4 = storeCls.checkMaxStore(evtName)

  t.is(max4, -1, 'Should be deleted by now')
})

test('Test a pre-registered method with maxCall', async (t) => {
  const evtCls = new To1SourceEvent({ logger })
  t.plan(7)
  return new Promise(resolve => {
    // just do a dev here first
    const evtName = 'max-call-2'
    evtCls.$only(evtName, (value: number) => {
      ++value
      t.pass()
      logger(evtName, value)
      if (value >= 3) {
        resolve()
      }
      return value
    })
    // const checkResult1 = evtCls.$get(evtName, true)
    // logger('checkResult1', checkResult1)
    const maxCall = evtCls.$max(evtName, 3) as Function
    
    const v1 = maxCall(0)
    // logger('v1 call result', evtCls.$done)
    t.is(v1, 2)
    const v2 = maxCall(1)
    // logger('v2 call result', evtCls.$done)
    t.is(v2, 1)
    const v3 = maxCall(2)
    // logger('v3 call result', evtCls.$done)
    t.is(v3, -1)
    // just see what happen
    const v4 = maxCall(100)
    t.truthy(v4)
  })
})

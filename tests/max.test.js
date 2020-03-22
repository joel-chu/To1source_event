// Testing and develop this onMax event handler
const test = require('ava')
const EventService = require('../dist/to1source-event.cjs')

const logger = require('debug')('to1source-event:test:on-max')

test.before(t => {
  t.context.evtCls = new EventService({ logger })
})


test(`Test the max count store`, t => {
  const evtCls = t.context.evtCls
  const evtName = 'max-store-test'

  const max1 = evtCls.checkMaxStore(evtName, 3)
  t.is(max1, 3, 'Should return the init max value')

  const max2 = evtCls.checkMaxStore(evtName)
  t.is(max2, 2)

  const max3 = evtCls.checkMaxStore(evtName)
  t.is(max3, 1)

  const max4 = evtCls.checkMaxStore(evtName)
  t.is(max4, -1, 'Should be deleted by now')

})


test.cb(`Test a pre-registered method with maxCall`, t => {
  t.plan(6)
  // just do a dev here first
  const evtCls = t.context.evtCls
  const evtName = 'max-call-2'

  // const checkResult = evtCls.$get(evtName, true)
  // t.false(checkResult)

  // now register a $only event
  evtCls.$only(evtName, (value) => {
    ++value
    t.pass()
    logger(evtName, value)
    if (value >= 3) {
      t.end()
    }
    return value
  })

  // const checkResult1 = evtCls.$get(evtName, true)
  // logger('checkResult1', checkResult1)

  const maxCall = evtCls.$max(evtName, 3)

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

})

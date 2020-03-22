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

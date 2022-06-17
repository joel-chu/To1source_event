// testing the watch method
const test = require('ava')
const { WatchClass } = require('../src/watch')
const debug = require('debug')('to1source-event:watch')
const To1sourceEvent = require('../dist/to1source-event.cjs')

test.before(t => {
  t.context.watchObj = new WatchClass()
  t.context.evtSrv = new To1sourceEvent({
    logger: debug.extend('test')
  })
})

test('We should have a watch method in the Object', t => {
  t.truthy(t.context.watchObj.watch)
})

test('should able to watch a property change', async (t) => {
  t.plan(3)
  return new Promise(resolver => {
    const obj = t.context.watchObj
    obj.prop = false
    obj.watch('prop', function(value, prop, oldValue) {
      t.is(value, true)
      t.is(prop, 'prop')
      t.is(oldValue, false)
      resolver(true)
    })
    setTimeout(() => {
      obj.prop = true
    }, 500)
    obj.newProp = 'something'
  })
})

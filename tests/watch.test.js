// testing the watch method
const test = require('ava')
const { WatchClass } = require('../src/watch')
const debug = require('debug')('nb-event-service:watch')
const NBEventService = require('../dist/nb-event-service.cjs')

test.before(t => {
  t.context.watchObj = new WatchClass()
  t.context.evtSrv = new NBEventService({
    logger: debug.extend('test')
  })
})

test('We should have a watch method in the Object', t => {
  t.truthy(t.context.watchObj.watch)
})

test.cb('should able to watch a property change', t => {
  t.plan(3)

  let obj = t.context.watchObj

  obj.prop = false

  obj.watch('prop', function(value, prop, oldValue) {
    t.is(value, true)
    t.is(prop, 'prop')
    t.is(oldValue, false)
    t.end()
  })
  setTimeout(() => {

    obj.prop = true;
  }, 500)

  obj.newProp = 'something'
})

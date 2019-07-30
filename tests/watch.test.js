// testing the watch method
const test = require('ava')
const { WatchClass } = require('../src/watch')
const debug = require('debug')('nb-event-service:watch')
const NBEventService = require('../main')

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

  let obj = t.context.watchObj;

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

  obj.newProp = 'something';
})

test.cb('Setting the suspend should able to trigger the release call', t => {

  t.plan(2)

  const evtName = 'unknown-operation'
  const evtSrv = t.context.evtSrv;

  evtSrv.$on(evtName, function(value) {
    return value + ' ha ha'
  })

  evtSrv.suspend = true;

  evtSrv.$trigger(evtName, 'you loser')

  t.falsy(evtSrv.$done)

  let q = evtSrv.$queues;

  debug('$queues', q)

  evtSrv.suspend = false;

  setTimeout(() => {
    t.is(evtSrv.$done, 'you loser ha ha')
    t.end()
  }, 1)

})

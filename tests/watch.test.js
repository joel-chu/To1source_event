// testing the watch method
const test = require('ava')
const { WatchClass } = require('../src/watch')
const debug = require('debug')('nb-event-service:watch')

test('We should have a watch method in the Object', t => {

  let int = new WatchClass()

  t.truthy(int.watch)
})


test.cb('should able to watch a property change', t => {
  t.plan(3)

  let obj = new WatchClass()

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

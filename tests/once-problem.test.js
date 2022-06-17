const test = require('ava')

const To1sourceEvent = require('../dist/to1source-event.cjs')
const logger = require('debug')('to1source-event')
const debug  = require('debug')('to1source-event:test:only-problem')
let value = 1000;

test.before( t => {
  t.context.evtSrv = new To1sourceEvent({
    logger
  })
})

test('This is how $once normally works', t => {
  // problem is when you call $trigger before you register it with $once
  const evtName = 'once-normal'
  const evtSrv = t.context.evtSrv

  evtSrv.$trigger(evtName, 1000)

  evtSrv.$once(evtName, function(val) {
    debug(val)
    return (val*0.1) + val;
  })

  t.is(evtSrv.$done, 1100, 'The first time call $done getter')

  evtSrv.$trigger(evtName)
  // it should be the same because it never get call again
  t.is(evtSrv.$done, 1100, 'The second time call $done getter')

})

test('$once should allow to add more than one listner', async (t) => {
  t.plan(3)
  return new Promise(resolver => {
    const evtName = 'more-once'
    const evtSrv = t.context.evtSrv

    evtSrv.$once(evtName, function() {
      debug('$once', 'First listener')
      t.pass()
      return 1
    })

    evtSrv.$once(evtName, function() {
      debug('$once', 'Second listener')
      t.pass()
      resolver(true)
      return 2
    })

    evtSrv.$call(evtName)()

    t.is(evtSrv.$done, 2)
  })

})

test('It should be fixed with the check type before adding to the store, but the $done value can be unpredictable', t => {

  const evtName = 'once-problem'
  const evtSrv = t.context.evtSrv

  evtSrv.$trigger(evtName, 1000)

  evtSrv.$on(evtName, function(val) {
    return (val*0.2) + val
  })
  // this should not add
  evtSrv.$once(evtName, function(val) {
    return (val*0.1) + val
  })

  evtSrv.$on(evtName, function(val) {
    return (val*0.3) + val
  })

  // now the first $on call hijacked the evt
  // I thought it will be 1300 but its 1200
  t.is(evtSrv.$done, 1200)

  evtSrv.$trigger(evtName, 2000)
  // but this work as expecte because the order of adding to it
  // where the last one was taken out from the lazyStore
  t.is(evtSrv.$done, 2600)

})

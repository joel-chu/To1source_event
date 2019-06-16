const test = require('ava')

const NBEventService = require('../main')
const logger = require('debug')('nb-event-service')
const debug  = require('debug')('nb-event-service:test:only-problem')
let value = 1000;

test.before( t => {
  t.context.evtSrv = new NBEventService({
    logger
  })
})

test('This is how $once normally works', t => {
  // problem is when you call $trigger before you register it with $once
  let evtName = 'once-normal';
  let evtSrv = t.context.evtSrv;

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

test.cb.only('$once should allow to add more than one listner', t => {
  t.plan(3)
  let evtName = 'more-once';
  let evtSrv = t.context.evtSrv;

  evtSrv.$once(evtName, function() {
    debug('$once', 'First listener')
    t.pass()
    return 1;
  })

  evtSrv.$once(evtName, function() {
    debug('$once', 'Second listener')
    t.pass()
    t.end()
    return 2;
  })

  evtSrv.$call(evtName)

  t.is(evtSrv.$done, 1)

})

test('Demonstrate the potential bug with $once', t => {

  let evtName = 'once-problem';
  let evtSrv = t.context.evtSrv;

  evtSrv.$trigger(evtName, 1000)

  evtSrv.$on(evtName, function(val) {
    return (val*0.2) + val;
  })

  evtSrv.$once(evtName, function(val) {
    return (val*0.1) + val;
  })
  // now the first $on call hijacked the evt
  t.is(evtSrv.$done, 1200)

})

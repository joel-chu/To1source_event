const test = require('ava')

const NBEventService = require('../main')
const logger = require('debug')('nb-event-service')
const debug  = require('debug')('nb-event-service:test:basic')
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

  t.is(evtSrv.$done, 1100)

})

test('Demonstrate the potential bug with $once', t => {

  let evtName = ''

})

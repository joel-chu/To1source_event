const test = require('ava')

const NBEventService =  require('../dist/nb-event-service.cjs')
const logger = require('debug')('nb-event-service')
const debug  = require('debug')('nb-event-service:test:only-once')
let value = 2000;

test.before(t => {
  t.context.evtSrv = new NBEventService({
    logger
  })
})

test('It should only add one callback and fire once with $onlyOnce', t => {

  let evtSrv = t.context.evtSrv;
  let evt = 'only-once-evt'
  evtSrv.$onlyOnce(evt, function() {
    debug('call me first')
    return 'first'
  })
  evtSrv.$onlyOnce(evt, function() {
    debug('call me again')
    return 'again'
  })

  evtSrv.$trigger(evt)

  t.is(evtSrv.$done, 'first')

  t.is(evtSrv.$trigger(evt), 0)

})

test('It should only get trigger once with only callback', t => {

  let evtSrv = t.context.evtSrv;
  let evt = 'only-once-evt-call'

  evtSrv.$trigger(evt)

  evtSrv.$onlyOnce(evt, function() {
    debug('call me call me')
    return 'me'
  })

  let list = evtSrv.$get(evt)

  t.falsy(list.length)

  evtSrv.$onlyOnce(evt, function() {
    debug('call me too')
    return 'too'
  })

  //evtSrv.$trigger(evt)

  t.is(evtSrv.$trigger(evt), 1)

  t.is(evtSrv.$done, 'too')

})

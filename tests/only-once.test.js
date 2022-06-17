const test = require('ava')

const To1sourceEvent =  require('../dist/to1source-event.cjs')
const logger = require('debug')('to1source-event')
const debug  = require('debug')('to1source-event:test:only-once')

let value = 2000

test.before(t => {
  t.context.evtSrv = new To1sourceEvent({
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

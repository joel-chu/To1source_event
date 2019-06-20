const test = require('ava')

const NBEventService = require('../main')
const logger = require('debug')('nb-event-service')
const debug  = require('debug')('nb-event-service:test:replace')
let value = 2000;

test.before(t => {
  t.context.evtSrv = new NBEventService({
    logger
  })
})

test('It should able to validate against the type', t => {
  let evtSrv = t.context.evtSrv;
  let wrongType = 'whatever'
  let fn = (type) => evtSrv.$replace('some-event', () => {}, null, type)

  t.throws(() => fn(wrongType), Error, 'It should throw if we pass the wrong type')

})


test.cb('It should able to replace the event callback', t => {
  let evtSrv = t.context.evtSrv;
  let evt = 'same-event'

  evtSrv.$on(evt, (n) => {
    debug('first callback', n)
  })

  evtSrv.$trigger(evt, 0)

  evtSrv.$replace(evt, (n) => {
    t.is(n, 1)
    t.end()
  })

  evtSrv.$trigger(evt, 1)

})

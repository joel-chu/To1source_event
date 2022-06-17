const test = require('ava')

const To1sourceEvent =  require('../dist/to1source-event.cjs')
const logger = require('debug')('to1source-event')
const debug  = require('debug')('to1source-event:test:replace')


test.before(t => {
  t.context.evtSrv = new To1sourceEvent({
    logger
  })
})

test('It should able to validate against the type', t => {
  let evtSrv = t.context.evtSrv
  let wrongType = 'whatever'
  let fn = (type) => evtSrv.$replace('some-event', () => {}, null, type)

  t.throws(
    () => fn(wrongType),
    undefined,
    'It should throw if we pass the wrong type'
  )

})


test('It should able to replace the event callback', async (t) => {
  t.plan(1)
  return new Promise(resolver => {
    const evtSrv = t.context.evtSrv
    const evt = 'same-event'

    evtSrv.$on(evt, (n) => {
      debug('first callback', n)
    })

    evtSrv.$trigger(evt, 0)

    evtSrv.$replace(evt, (n) => {
      t.is(n, 1)
      resolver(true)
    })

    evtSrv.$trigger(evt, 1)
  })
})

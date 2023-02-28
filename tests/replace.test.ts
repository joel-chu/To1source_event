import test from 'ava'
import To1SourceEvent from '../src'
import debug from 'debug'

const logger = debug('to1source-event')
const _debug = debug('to1source-event:test:replace')


const evtSrv = new To1SourceEvent({ logger })

test('It should able to validate against the type', t => {
  const wrongType = 'whatever'
  const fn = (type: string) => evtSrv.$replace('some-event', () => {}, null, type)

  t.throws(
    () => fn(wrongType),
    undefined,
    'It should throw if we pass the wrong type'
  )
})


test('It should able to replace the event callback', async (t) => {
  t.plan(1)
  return new Promise(resolve => {
    const evt = 'same-event'

    evtSrv.$on(evt, (n: number) => {
      _debug('first callback', n)
    })

    evtSrv.$trigger(evt, 0)

    evtSrv.$replace(evt, (n) => {
      t.is(n, 1)
      resolve()
    })

    evtSrv.$trigger(evt, 1)
  })
})

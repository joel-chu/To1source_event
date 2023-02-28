import test from 'ava'
import To1SourceEvent from '../src'

import debug from 'debug'

const logger = debug('to1source-event')
const _debug = debug('to1source-event:test:lazy')

const evtSrv = new To1SourceEvent({ logger })

test('when using the context as type in lazy store, other type should not able to add to lazystore', t => {
  const es = evtSrv
  const evt = 'not-here-yet'
  // first we trigger an non-exist event

  es.$trigger(evt, 1, null, 'on')
  es.$trigger(evt, 2, null, 'only')

  //  now the lazy store should have only one item
  const content = es.$take(evt)

  _debug(content)
  // @ts-ignore
  t.is(content.size, 1)
})

test('It should throw an error if the event been trigger with one type but try to register with another', t => {
  const es = evtSrv
  const evt = 'some-event'

  es.$trigger(evt, 1, null, 'on')

  const fn = (num: number) => es.$only(evt, num => {
    _debug(num)
  })

  t.throws(
    () => fn(1),
    undefined,
    'It should throw error because its different type'
  )
})

test('using $call should able to pass the type without passing the context', t => {
  const es = evtSrv
  const evt = 'just-calling'

  es.$call(evt, 'only')(100)

  const fn = (num: number) => es.$on(evt, num => {
    _debug(num)
  })

  t.throws(
    () => fn(1),
    undefined,
    'It should throw error because already register with $only'
  )

})

// testing the lazy store with a type using the context parameter
const test = require('ava')

const To1sourceEvent =  require('../dist/to1source-event.cjs')
const logger = require('debug')('to1source-event')
const debug  = require('debug')('to1source-event:test:lazy')

test.before(t => {
  t.context.evtSrv = new To1sourceEvent({
    logger
  })
})

test('when using the context as type in lazy store, other type should not able to add to lazystore', t => {
  const es = t.context.evtSrv
  const evt = 'not-here-yet'
  // first we trigger an non-exist event

  es.$trigger(evt, 1, null, 'on')
  es.$trigger(evt, 2, null, 'only')

  //  now the lazy store should have only one item
  let content = es.takeFromStore(evt)

  debug(content)

  t.is(content.size, 1)
})

test('It should throw an error if the event been trigger with one type but try to register with another', t => {
  const es = t.context.evtSrv
  const evt = 'some-event'

  es.$trigger(evt, 1, null, 'on')

  const fn = (num) => es.$only(evt, num => {
    debug(num)
  })

  t.throws(() => fn(), /*Error*/ null, 'It should throw error because its different type')
})

test('using $call should able to pass the type without passing the context', t => {
  const es = t.context.evtSrv
  const evt = 'just-calling'

  es.$call(evt, 'only')(100)

  const fn = (num) => es.$on(evt, num => {
    debug(num)
  })

  t.throws(
    () => fn(), 
    /*Error*/null, 
    'It should throw error because already register with $only'
  )

})

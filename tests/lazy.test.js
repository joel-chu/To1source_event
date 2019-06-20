// testing the lazy store with a type using the context parameter
const test = require('ava')

const NBEventService = require('../main')
const logger = require('debug')('nb-event-service')
const debug  = require('debug')('nb-event-service:test:lazy')

test.before(t => {
  t.context.evtSrv = new NBEventService({
    logger
  })
})

test('when using the context as type in lazy store, other type should not able to add to lazystore', t => {
  let es = t.context.evtSrv;
  let evt = 'not-here-yet'
  // first we trigger an non-exist event

  es.$trigger(evt, 1, null, 'on')
  es.$trigger(evt, 2, null, 'only')

  //  now the lazy store should have only one item
  let content = es.takeFromStore(evt)

  debug(content)

  t.is(content.size, 1)
})

test('It should throw an error if the event been trigger with one type but try to register with another', t => {
  let es = t.context.evtSrv;
  let evt = 'some-event'

  es.$trigger(evt, 1, null, 'on')

  const fn = (num) => es.$only(evt, num => {
    debug(num)
  })

  t.throws(() => fn(), Error, 'It should throw error because its different type')
})

test('using $call should able to pass the type without passing the context', t => {
  let es = t.context.evtSrv;
  let evt = 'just-calling'

  es.$call(evt, 100, 'only')

  const fn = (num) => es.$on(evt, num => {
    debug(num)
  })

  t.throws(() => fn(), Error, 'It should throw error because already register with $only')

})

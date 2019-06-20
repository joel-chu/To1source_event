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

test('It should able to save to lazy store with a type using the context parameter', t => {
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

test.todo('when using the context as type in lazy store, other type should not able to add to lazystore')

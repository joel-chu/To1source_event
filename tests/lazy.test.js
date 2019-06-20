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

test.todo('It should able to save to lazy store with a type using the context parameter')

test.todo('when using the context as type in lazy store, other type should not able to add to lazystore')

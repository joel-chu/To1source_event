// There is a problem with the http return result being array
// but by the time it got to the client, it only return the first item in the array
const test = require('ava')

const To1sourceEvent = require('../dist/to1source-event.cjs')
const logger = require('debug')('to1source-event:test:array')

test.before(t => {
  t.context.evtSrv = new To1sourceEvent({
    logger
  })
  t.context.arrayParam = ['cats', 'dog', 'pig']
})

test(`We should able to get the result back as an array`, async (t) => {
  t.plan(1)
  return new Promise(resolver => {
    let evtName = 'array-params'
    const evt = t.context.evtSrv

    evt.$on(evtName, function(value) {
      logger('value', value)
      t.is(3, value.length)
      resolver(true)
      return value
    })

    evt.$call(evtName)(t.context.arrayParam)
  })
})

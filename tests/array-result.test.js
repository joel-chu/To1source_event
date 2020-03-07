// There is a problem with the http return result being array
// but by the time it got to the client, it only return the first item in the array
const test = require('ava')

const To1sourceEvent = require('../dist/to1source-event.cjs')
const logger = require('debug')('nb-event-service:test:array')

test.before(t => {
  t.context.evtSrv = new To1sourceEvent({
    logger
  })
  t.context.arrayParam = ['cats', 'dog', 'pig']
})

test.cb(`We should able to get the result back as an array`, t => {

  t.plan(1)
  let evtName = 'array-params'
  const evt = t.context.evtSrv

  evt.$on(evtName, function(value) {
    logger('value', value)
    t.is(3, value.length)
    t.end()
    return value
  })

  evt.$call(evtName)(t.context.arrayParam)

})

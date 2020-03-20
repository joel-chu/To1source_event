// Testing and develop this onMax event handler
const test = require('ava')
const { 
  ON_MAX_TYPE,
  ON_MAX_META_NAME 

} = require('../src/constants')
const { NB_EVENT_SERVICE_PRIVATE_STORE } = require('../src/store')

const debug = require('debug')('to1source-event:test:on-max')

test(`First testing how to store meta data to the store before any callback get register`, t => {
  const evtName = 'some-event-only-allow-max-2'
  const store = NB_EVENT_SERVICE_PRIVATE_STORE
  
  const self = this

  const fnSet = new Set()

  debug('set size', fnSet.size)

  t.falsy(fnSet.size, 'new set should be empty')

  const payload = [ON_MAX_META_NAME, null, null, ON_MAX_TYPE]

  fnSet.add(payload)

  store.set(self, fnSet)

  debug('after add size', fnSet.size)

  t.truthy(fnSet.size, 'after add', store)

})


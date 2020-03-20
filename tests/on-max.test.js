// Testing and develop this onMax event handler
const test = require('ava')
const { ON_MAX_META_NAME } = require('../src/constants')
const { NB_EVENT_SERVICE_PRIVATE_STORE } = require('../src/store')


test(`First testing how to store meta data to the store before any callback get register`, t => {
  const evtName = 'some-event-only-allow-max-2'
  const store = NB_EVENT_SERVICE_PRIVATE_STORE

  t.pass()

})


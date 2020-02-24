// There is a problem with the http return result being array
// but by the time it got to the client, it only return the first item in the array
const test = require('ava')

const NBEventService = require('../dist/nb-event-service-alias.cjs')
const debug  = require('debug')('nb-event-service:test:array')

test.cb(`We should able to get the result back as an array`, t => {
  

})

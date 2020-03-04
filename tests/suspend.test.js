// test the suspend feature
const test = require('ava')
const NBEventService = require('../dist/nb-event-service.cjs')
const logger = require('debug')('nb-event-service')
const debug  = require('debug')('nb-event-service:test:basic')
let value = 1000

test.before( t => {
  t.context.evtSrv = new NBEventService({
    logger
  })
})


test.todo(`It should able to use the suspend to hold all the calls`)

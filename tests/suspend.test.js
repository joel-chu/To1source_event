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

test.cb(`It should able to use the suspend to hold all the calls then release it`, t => {
  t.plan(2)
  const evtSrv = t.context.evtSrv

  evtSrv.$on('some-event', value => {
    const result = value + 1
    debug('result:', result)
    return result
  })

  evtSrv.$suspend = true

  evtSrv.$trigger('some-event', 100)
  // what happen inside
  t.falsy(evtSrv.$done) // null

  evtSrv.$suspend = false
  // what happen now

  setTimeout(() => {
    t.is(evtSrv.$done, 101) // 101
    t.end()
  },10)


})

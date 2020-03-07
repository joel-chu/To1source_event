// test the suspend feature
const test = require('ava')
const To1sourceEvent = require('../dist/to1source-event.cjs')
const logger = require('debug')('nb-event-service')
const debug  = require('debug')('nb-event-service:test:basic')
let value = 1000

test.before( t => {
  t.context.evtSrv = new To1sourceEvent({
    logger
  })
})


test.only(`Just play with the regex`, t => {
  const pattern = '_private'

  debug(typeof /\_private/)

  t.truthy('jsonql_private'.indexOf(pattern))
  t.falsy('jsonql_public'.indexOf(pattern) > -1)
  t.truthy('jsonql_private_someFunc_onReady'.indexOf(pattern))
})


test(`It should able to use the suspend to hold all the calls then release it`, t => {
  // t.plan(2)
  const evtSrv = t.context.evtSrv

  evtSrv.$on('some-event', value => {
    const result = value + 1
    debug('result:', result)
    return result
  })

  evtSrv.$suspend()

  evtSrv.$trigger('some-event', 100)
  // what happen inside
  t.falsy(evtSrv.$done) // null

  evtSrv.$release()
  // what happen now
  t.is(evtSrv.$done, 101) // 101

})

test(`Testing the $suspendEvent method`, t => {

  const evt = new

  $on('some-event-ok', () => {
    console.log('ok')
  })

  $on('some-event-not-great', () => {
    console.log('Not great!')
  })
  // @NOTE you can pass the entire event name or just part that can match by indexOf
  $suspendEvent(`-not-great`)

  $trigger('some-event-ok')
  $trigger('some-event-not-great')

  $release()

})

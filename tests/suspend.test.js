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
  const evt1 = 'jsonql_private'
  const evt2 = 'jsonql_public'

  t.truthy(evt1.indexOf(pattern))
  t.falsy(evt2.indexOf(pattern) > -1)
  t.truthy('jsonql_private_someFunc_onReady'.indexOf(pattern))


  const pattern1 = /\_private/

  // debug(/\_private/ instanceof RegExp)

  debug(pattern1.test(evt1))
  debug(pattern1.test(evt2))

  const patternRegExp = new RegExp(pattern)

  debug(patternRegExp.test(evt1))
  debug(patternRegExp.test(evt2))
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

test.cb(`Testing the $suspendEvent method`, t => {
  t.plan(1)

  const evt = new To1sourceEvent({ logger })

  evt.$on('some-event-ok', () => {
    debug('ok')
    t.pass()
    t.end()
  })
  // this shouldn't pass
  evt.$on('some-event-not-great', () => {
    debug('Not great!')
    t.end()
  })
  // @NOTE you can pass the entire event name or just part that can match by indexOf
  evt.$suspendEvent(`-not-great`)

  evt.$trigger('some-event-ok')
  evt.$trigger('some-event-not-great')

  evt.$release()

})

// test the suspend feature
const test = require('ava')
const To1sourceEvent = require('../dist/to1source-event.cjs')
const logger = require('debug')('nb-event-service')
const debug  = require('debug')('nb-event-service:test:basic')

const { getRegex, isRegExp } = require('../src/utils')

let value = 1000

test.before( t => {
  t.context.evtSrv = new To1sourceEvent({
    logger
  })
})


test(`Just play with the regex`, t => {
  const pattern = '_private'
  const evt1 = 'jsonql_private'
  const evt2 = 'jsonql_public'

  t.truthy(evt1.indexOf(pattern))
  t.falsy(evt2.indexOf(pattern) > -1)
  t.truthy('jsonql_private_someFunc_onReady'.indexOf(pattern))

  const pat1 = getRegex('some-string')
  const pat2 = getRegex(/some-pattern/)
  const pat3 = getRegex(new RegExp('whatever'))
  debug('pat1 pass a string', isRegExp(pat1))
  debug('pat2 pass a string regex', isRegExp(pat2))
  debug('pat3 pass a init RegExp object', isRegExp(pat3))
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
})

test(`Test the combine $suspendEvent and $releaseEvent`, t => {

  const evtSrv = new To1sourceEvent({ logger })

  evtSrv.$on('some-event-ok', () => {
    console.log('OK')
  })

  evtSrv.$on('some-event-not-great', () => {
    console.log('Not great!')
  })

  evtSrv.$on('the-usa-is-not-great', () => {
    console.log(`USA sucks!`)
  })

  evtSrv.$on('the-uk-is-not-great', () => {
    console.log(`UK sucks!`)
  })

  evtSrv.$on('some-other-event-name', () => {
    console.log(`I will not get affected and continue to work as it was expected`)
  })

  // @NOTE you can pass the entire event name or just part that can match
  evtSrv.$suspendEvent(`-not-great`)

  evtSrv.$trigger('some-event-ok') // this will get exeucted

  evtSrv.$trigger('some-event-not-great') // this will not get exeucted
  evtSrv.$trigger('the-usa-is-not-great')
  evtSrv.$trigger('the-uk-is-not-great')

  evtSrv.$trigger('some-other-event-name') // this will get execute

  const ctn = evtSrv.$releaseEvent(`-not-great`) // now anything with *-not-great will get released

  t.is(ctn, 3)

})


test(`Test the news suspend queue as an array`, t => {
  let queue = []

  let p1 = getRegex('some-event-name')

  // queue.push(p1)

  const check1 = !queue.filter(q => q === p1).length

  t.true(check1)

  queue.push(p1)
  
  const check2 = !queue.filter(q => q === p1).length 

  t.false(check2)
  

})
// test the suspend feature
const test = require('ava')
const To1sourceEvent = require('../dist/to1source-event.cjs')
const logger = require('debug')('to1source-event')
const debug  = require('debug')('to1source-event:test:basic')

const { getRegex, isRegExp } = require('./fixtures/utils.cjs')

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

test(`Testing the $suspendEvent method`, async (t) => {
  t.plan(1)
  return new Promise(resolver => {
    const evt = new To1sourceEvent({ logger })

    evt.$on('some-event-ok', () => {
      debug('ok')
      t.pass()
      resolver(true)
    })
    // this shouldn't pass
    evt.$on('some-event-not-great', () => {
      debug('Not great!')
    })
    // @NOTE you can pass the entire event name or just part that can match by indexOf
    evt.$suspendEvent(`-not-great`)

    evt.$trigger('some-event-ok')
    evt.$trigger('some-event-not-great')
  })
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

  debug('ctn', ctn)

  t.is(ctn, 3)

})

test(`Testing the multiple suspendEvent and releaseEvent`, async (t) => {
  const plan = 5
  t.plan(plan)

  return new Promise(resolver => {

    let ctn = 0

    const loggerX = (str, ...args) => Reflect.apply(debug, null, ['LoggerX --->', str, ...args])

    const loggerY = (str, ...args) => Reflect.apply(debug, null, ['LoggerY --->', str, ...args])

    const eventNames = [
      `jsonql/public_onReady`,
      `jsonql/public_onEmit`,
      `jsonql/private_onLogin`,
      `jsonql/private_onEmit`
    ]

    const evtSrv = new To1sourceEvent({ logger: loggerX })
    // this will not get affected
    evtSrv.$on(`add`, function(from) {
      ++ctn
      if (from === 'test-add') {
        loggerY('test-add got triggered')
        t.pass()
        return
      }
      loggerY(from)
      if (ctn >= plan) {
        resolver(true)
      }
      return ctn
    })
    const add = from => evtSrv.$trigger('add', [from])

    evtSrv.$only(eventNames[0], function(namespace) {
      t.truthy(namespace, '[1]') // 1
      add(eventNames[0])
    })

    evtSrv.$only(eventNames[1], function(payload) {
      t.truthy(payload, '[2]')
      add(eventNames[1])
    })

    evtSrv.$only(eventNames[2], function() {
      t.pass('[3]')
      add(eventNames[2])
    })

    evtSrv.$only(eventNames[3], function(payload) {
      t.truthy(payload, '[4]')
      add(eventNames[3])
    })

    // hold the events

    evtSrv.$suspendEvent(`jsonql/public`, `jsonql/private`)

    add('test-add')

    evtSrv.$trigger(eventNames[0], ['jsonql/public'])

    evtSrv.$trigger(eventNames[1], [{name: 'Joel'}])

    evtSrv.$trigger(eventNames[2], [])

    evtSrv.$trigger(eventNames[3], [{msg: 'nothing'}])

    // up until this point there is nothing been trigger

    evtSrv.$releaseEvent(`jsonql/public`)

    evtSrv.$releaseEvent(`jsonql/private`)

  })

})

import test from 'ava'

import To1SourceEvent from '../src'
import debug from 'debug'

const logger0 = console.info //debug('to1source-event')
const logger1 = debug('to1source-event:test:basic')

let value = 1000
// @ts-ignore
let evtSrv: To1SourceEvent

test.before(() => {
  evtSrv = new To1SourceEvent({ logger: logger0 })
})

test('Should have a $name getter', t => {
  t.is('@to1source/event', evtSrv.$name)
})

test('It should able to validate the evt', t => {
  const fn = (...args: Array<any>) => Reflect.apply(evtSrv.$on, evtSrv, args)
  t.throws(
    () => fn('some', false) ,
    undefined,
    'Should throw error because callback is not a function'
  )
})

test('It should able to bind a simple test and callback', async (t) => {
  t.plan(1)
  return new Promise(resolve => {
    const evtName = 'simple'
    evtSrv.$on(evtName, function(num) {
      t.is(num, value)
      resolve()
    })
    evtSrv.$trigger(evtName, value)
  })
})

test('It should able to emit the event before register the listener', async (t) => {
  t.plan(1)
  return new Promise(resolve => {
    const evtName = 'simple-reverse'
    evtSrv.$trigger(evtName, value)
    evtSrv.$on(evtName, function(num) {
      t.is(num, value)
      resolve()
    })
  })
})


test('It should able to add more than one listerner to the same event', async (t) => {
  t.plan(2)
  return new Promise(resolve => {
    const evtName = 'multiple'
    const letter = 'again'

    evtSrv.$on(evtName, function(a) {
      t.is(a , letter)
    })

    evtSrv.$on(evtName, function(b) {
      t.is(b, letter)
      resolve()
    })

    evtSrv.$trigger(evtName, letter)
  })
})

test('It should not allow to add the same function again', t => {
  let evtName = 'add-once'
  const callback = (x: any) => {
    logger1(x)
  }

  evtSrv.$on(evtName, callback)
  evtSrv.$on(evtName, callback)

  let ctn = evtSrv.$get(evtName) as Array<any>

  t.is(ctn.length, 1)
})

test('It should only call once if we use the $once option', t => {
  const evtName = 'once-call'
  let ctn0 = 0

  logger1(evtName, ctn0)

  const callback0 = () => {
    ++ctn0
    logger1(ctn0)
  return ctn0
  }

  const callback2 = () => {
    ++ctn0
    logger1(ctn0)
  return ctn0
  }

  evtSrv.$once(evtName, callback0)
  evtSrv.$once(evtName, callback2)

  evtSrv.$trigger(evtName)
  evtSrv.$trigger(evtName)

  t.is(ctn0, 1)

})

test('Using the $call alias to $trigger should do the same thing', t => {
  const evtName = 'alias'
  let ctn1 = 0

  const callback = () => {
    ++ctn1
    logger1(ctn1)
    return ctn1
  }

  evtSrv.$once(evtName, callback)
  evtSrv.$trigger(evtName)
  evtSrv.$call(evtName)()

  t.is(ctn1, 1)
})

test.only('Using $trigger and $call should make the callback run again', t => {
  const evtName = 'alias-two'
  let ctn2 = 0

  const callback = () => {
    ++ctn2
    logger1(ctn2)
    return ctn2
  }

  evtSrv.$trigger(evtName)
  evtSrv.$call(evtName)()

  evtSrv.$on(evtName, callback)

  t.is(ctn2, 2)
})

test('Should not able to call the method once the $off is called', t => {

  const evtName = 'off-event'

  const callback = (l: any) => {
    logger1(`${l}`)
  }

  evtSrv.$on(evtName, callback)

  evtSrv.$off(evtName)

  evtSrv.$trigger(evtName)

  t.false(evtSrv.$get(evtName))

})

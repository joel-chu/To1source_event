// test the alias version to make sure it works
const test = require('ava')

const To1sourceEvent = require('../dist/alias.cjs')
const logger = require('debug')('to1source-event')
const debug  = require('debug')('to1source-event:test:basic')

let value = 1000

test.before( t => {
  t.context.evtSrv = new To1sourceEvent({
    logger
  })
})

test('It should able to bind a simple test and callback', async (t) => {
  t.plan(1)
  return new Promise(resolver => {
    const evtName = 'simple'
    t.context.evtSrv.on(evtName, function(num) {
      t.is(num, value)
      resolver(true)
    })
    t.context.evtSrv.emit(evtName, value)
  })
})

test('It should able to emit the event before register the listener', async (t) => {
  t.plan(1)
  return new Promise(resolver => {
    const evtName = 'simple-reverse'
    t.context.evtSrv.emit(evtName, value)
    t.context.evtSrv.on(evtName, function(num) {
      t.is(num, value)
      resolver(true)
    })
  })
})

test('It should able to add more than one listerner to the same event', async (t) => {
  t.plan(2)
  return new Promise(resolver => {
    const evtName = 'multiple'
    const letter = 'again'

    t.context.evtSrv.on(evtName, function(a) {
      t.is(a , letter)
    })

    t.context.evtSrv.on(evtName, function(b) {
      t.is(b, letter)
      resolver(true)
    })
    t.context.evtSrv.emit(evtName, letter)
  })
})

test('It should not allow to add the same function again', t => {
  const evtName = 'add-once'
  const callback = (x) => {
    debug(x)
  }

  t.context.evtSrv.on(evtName, callback)
  t.context.evtSrv.on(evtName, callback)

  let ctn = t.context.evtSrv.get(evtName)

  t.is(ctn.length, 1)
})

test('It should only call once if we use the $once option', t => {
  const evtName = 'once-call'
  let ctn = 0

  const callback = () => {
    ++ctn;
    debug(ctn)
  }

  const callback2 = () => {
    ++ctn;
    debug(ctn)
  }

  t.context.evtSrv.once(evtName, callback)
  t.context.evtSrv.once(evtName, callback2)

  t.context.evtSrv.emit(evtName)
  t.context.evtSrv.emit(evtName)

  t.is(ctn, 1)

})

test('Using the $call alias to $trigger should do the same thing', t => {
  const evtName = 'alias'
  let ctn = 0

  const callback = () => {
    ++ctn;
    debug(ctn)
  }
  t.context.evtSrv.once(evtName, callback)
  t.context.evtSrv.emit(evtName)
  t.context.evtSrv.$call(evtName)()

  t.is(ctn, 1)
})

test('Using $trigger and $call should make the callback run again', t => {
  const evtName = 'alias-two'
  let ctn = 0

  const callback = () => {
    ++ctn;
    debug(ctn)
  }

  t.context.evtSrv.emit(evtName)
  t.context.evtSrv.$call(evtName)()

  t.context.evtSrv.on(evtName, callback)

  t.is(ctn, 2)

})

test('Should not able to call the method once the $off is called', t => {

  const evtName = 'off-event'

  const callback = (l) => {
    debug(`${l}`)
  }

  t.context.evtSrv.on(evtName, callback)

  t.context.evtSrv.off(evtName)

  t.context.evtSrv.emit(evtName)

  t.false(t.context.evtSrv.get(evtName))

})

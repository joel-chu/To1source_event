// test the alias version to make sure it works
const test = require('ava')

const To1sourceEvent = require('../dist/alias')
const logger = require('debug')('nb-event-service')
const debug  = require('debug')('nb-event-service:test:basic')
let value = 1000;

test.before( t => {
  t.context.evtSrv = new To1sourceEvent({
    logger
  })
})

test.cb('It should able to bind a simple test and callback', t => {
  t.plan(1)
  let evtName = 'simple'
  t.context.evtSrv.on(evtName, function(num) {
    t.is(num, value)
    t.end()
  })
  t.context.evtSrv.emit(evtName, value)
})

test.cb('It should able to emit the event before register the listener', t => {
  t.plan(1)
  let evtName = 'simple-reverse'

  t.context.evtSrv.emit(evtName, value)

  t.context.evtSrv.on(evtName, function(num) {
    t.is(num, value)
    t.end()
  })
})

test.cb('It should able to add more than one listerner to the same event', t => {
  t.plan(2)

  let evtName = 'multiple'
  let letter = 'again'

  t.context.evtSrv.on(evtName, function(a) {
    t.is(a , letter)
  })

  t.context.evtSrv.on(evtName, function(b) {
    t.is(b, letter)
    t.end()
  })

  t.context.evtSrv.emit(evtName, letter)

})

test('It should not allow to add the same function again', t => {
  let evtName = 'add-once'
  const callback = (x) => {
    debug(x)
  }

  t.context.evtSrv.on(evtName, callback)
  t.context.evtSrv.on(evtName, callback)

  let ctn = t.context.evtSrv.get(evtName)

  t.is(ctn.length, 1)
})

test('It should only call once if we use the $once option', t => {
  let evtName = 'once-call'
  let ctn = 0;

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
  let evtName = 'alias'
  let ctn = 0;

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
  let evtName = 'alias-two'
  let ctn = 0;

  const callback = () => {
    ++ctn;
    debug(ctn)
  }

  t.context.evtSrv.emit(evtName)
  t.context.evtSrv.$call(evtName)()

  t.context.evtSrv.on(evtName, callback)

  t.is(ctn, 2)

  t.pass()
})

test('Should not able to call the method once the $off is called', t => {

  let evtName = 'off-event'

  const callback = (l) => {
    debug(`${l}`)
  }

  t.context.evtSrv.on(evtName, callback)

  t.context.evtSrv.off(evtName)

  t.context.evtSrv.emit(evtName)

  t.false(t.context.evtSrv.get(evtName))

})

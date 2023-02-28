import test from 'ava'
import To1SourceEvent from '../src/alias'

import debug from 'debug'

const logger = debug('to1source-event')
const _debug = (...args: Array<string>) => Reflect.apply(console.info, console, ['alias-debug'].concat(args))

let value = 1000
const evtSrv = new To1SourceEvent({ logger })

test('It should able to bind a simple test and callback', async (t) => {
  t.plan(1)
  return new Promise(resolve => {
    const evtName = 'simple'
    evtSrv.on(evtName, function(num: number) {
      t.is(num, value)
      resolve()
    })
    evtSrv.emit(evtName, value)
  })
})

test('It should able to emit the event before register the listener', async (t) => {
  t.plan(1)
  return new Promise(resolve => {
    const evtName = 'simple-reverse'
    evtSrv.emit(evtName, value)
    evtSrv.on(evtName, function(num: number) {
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

    evtSrv.on(evtName, function(a: string) {
      t.is(a , letter)
    })

    evtSrv.on(evtName, function(b: string) {
      t.is(b, letter)
      resolve()
    })
    evtSrv.emit(evtName, letter)
  })
})

test('It should not allow to add the same function again', t => {
  const evtName = 'add-once'
  const callback = (x: unknown) => {
    _debug(x as string)
  }

  evtSrv.on(evtName, callback)
  evtSrv.on(evtName, callback)

  let ctn = evtSrv.get(evtName)

  t.is(ctn.length, 1)
})

test('It should only call once if we use the $once option', t => {
  const evtName = 'once-call'
  let ctn = 0

  const callback = () => {
    ++ctn;
    _debug(ctn as unknown as string)
  }

  const callback2 = () => {
    ++ctn;
    _debug(ctn as unknown as string)
  }

  evtSrv.once(evtName, callback)
  evtSrv.once(evtName, callback2)

  evtSrv.emit(evtName)
  evtSrv.emit(evtName)

  t.is(ctn, 1)

})

test('Using the $call alias to $trigger should do the same thing', t => {
  const evtName = 'alias'
  let ctn = 0

  const callback = () => {
    ++ctn;
    _debug(ctn as unknown as string)
  }
  evtSrv.once(evtName, callback)
  evtSrv.emit(evtName)
  evtSrv.$call(evtName)()

  t.is(ctn, 1)
})

test('Using $trigger and $call should make the callback run again', t => {
  const evtName = 'alias-two'
  let ctn = 0

  const callback = () => {
    ++ctn;
    _debug(ctn as unknown as string)
  }

  evtSrv.emit(evtName)
  evtSrv.$call(evtName)()

  evtSrv.on(evtName, callback)

  t.is(ctn, 2)

})

test('Should not able to call the method once the $off is called', t => {

  const evtName = 'off-event'

  const callback = (l: string) => {
    _debug(`${l}`)
  }

  evtSrv.on(evtName, callback)

  evtSrv.off(evtName)

  evtSrv.emit(evtName)

  t.false(evtSrv.get(evtName))

})

import test from 'ava'

import To1SourceEvent from '../src'

const logger = console.info

const evtSrv = new To1SourceEvent({ logger })

const arrayParam = ['cats', 'dog', 'pig']

test('We should able to get the result back as an array', async t => {
  t.plan(1)

  return new Promise(resolve => {
    const evtName = 'array-params'

    evtSrv.$on(evtName, function(value: Array<string>) {
      logger('value', value)
      t.is(3, value.length)
      resolve()
      return value
    })

    evtSrv.$call(evtName)(arrayParam)
  })

})

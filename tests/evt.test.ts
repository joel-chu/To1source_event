import test from 'ava'
import { trueTypeOf } from '../src/lib/utils'

test('Test out the validation with Symbol type', t => {

  const evt = Symbol('event name')

  console.log(trueTypeOf(evt))

  t.pass()
})

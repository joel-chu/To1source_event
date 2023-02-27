import test from 'ava'
import { trueTypeOf, toString } from '../src/lib/utils'

test('Test out the validation with Symbol type', t => {

  const evt = Symbol('event name')

  console.log(trueTypeOf(evt))

  console.log('?', toString(evt))

  t.pass()
})

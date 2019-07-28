// testing the watch method
const test = require('ava')
require('../src/watch')


test('We should have a watch method in the Object', t => {

  t.truthy(Object.watch)

})

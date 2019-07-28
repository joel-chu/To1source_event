// testing the watch method
const test = require('ava')
require('../src/watch')


test.cb('We should have a watch method in the Object', t => {

  test.truthy(Object.watch)

})

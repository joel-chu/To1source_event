// testing the using Map and Set
const test = require('ava')
const debug = require('debug')('nb-event-service:test:map-set')

test('A Set should not allow the same thing add twice', t => {
  let ctn = 0;
  let testSet = new Set()
  const testFn = () => {
    console.log(`call me ${++ctn}`)
  }
  testSet.add(testFn)
  testSet.add(testFn)
  t.is(testSet.size, 1)
})

test('It should able to store a Set inside a Map', t => {
  let ctn = 0;
  const testFnA = () => {
    console.log(`call A ${++ctn}`)
  }

  const testFnB = () => {
    console.log(`call B ${++ctn}`)
  }

  let testMap = new Map()
  let testSet = new Set()

  testMap.set('key-1', testSet)
  let ts1 = testMap.get('key-1')
  ts1.add(testFnA)
  ts1.add(testFnB)

  t.is(testMap.get('key-1').size, 2)

  for (let fn of ts1) {
    fn()
  }

  t.pass()

})

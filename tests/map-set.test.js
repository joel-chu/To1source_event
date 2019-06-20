// testing the using Map and Set
const test = require('ava')
const debug = require('debug')('nb-event-service:test:map-set')

test('A Set should not allow the same thing add twice', t => {
  let ctn = 0;
  let testSet = new Set()
  const testFn = () => {
    debug(`call me ${++ctn}`)
  }
  // problem - can only store primitive type that id is the same
  testSet.add(testFn)
  testSet.add(testFn)
  t.is(testSet.size, 1)
})

test('It should able to store a Set inside a Map', t => {
  let ctn = 0;
  const testFnA = () => {
    debug(`call A ${++ctn}`)
  }

  const testFnB = () => {
    debug(`call B ${++ctn}`)
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

test('It should able to store multiple level within a class structure and act like a private property', t => {
  const testFnB = () => {
    debug(`call B ${++ctn}`)
  }

  let PRIVATE_STORE = new Map()
  class Dummy {

    add(item) {
      PRIVATE_STORE.set(this, item)
    }

    get() {
      return PRIVATE_STORE.get(this)
    }
  }

  let dummyIns = new Dummy()

  let mapA = new Map()
  let toAdd1 = new Set()
  mapA.set('a', toAdd1)
  let toAdd1a = mapA.get('a')
  toAdd1a.add(testFnB)
  toAdd1a.add(testFnB)
  dummyIns.add(mapA)

  let dummyValue1 = dummyIns.get()

  t.is( dummyValue1.get('a').size, 1 )

  t.pass()
})

test('It should store one item if its adding different thing to the same key', t => {
  let ctn = 0;
  const testFnA = () => {
    debug(`call A ${++ctn}`)
  }
  const testFnB = () => {
    debug(`call B ${++ctn}`)
  }
  let PRIVATE_STORE = new Map()
  class Dummy {
    add(item) {
      PRIVATE_STORE.set(this, item)
    }
    get() {
      return PRIVATE_STORE.get(this)
    }
  }

  let dummyInstance = new Dummy()

  let mapA = new Map();
  mapA.set('key-1', testFnA)
  let mapB = new Map();
  mapB.set('key-2', testFnB)

  dummyInstance.add(mapA)
  dummyInstance.add(mapB)

  t.truthy( dummyInstance.get().has('key-2') )


})

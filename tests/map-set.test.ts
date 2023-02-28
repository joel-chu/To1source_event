// low level DBD
import test from 'ava'
import debug from 'debug'

const _debug = debug('to1source-event:test:map-set')

test('A Set should not allow the same thing add twice', t => {
  let ctn = 0
  const testSet = new Set()
  const testFn = () => {
    _debug(`call me ${++ctn}`)
  }
  // problem - can only store primitive type that id is the same
  testSet.add(testFn)
  testSet.add(testFn)
  t.is(testSet.size, 1)
})

test('It should able to store a Set inside a Map', t => {
  let ctn = 0
  const testFnA = () => {
    _debug(`call A ${++ctn}`)
  }

  const testFnB = () => {
    _debug(`call B ${++ctn}`)
  }

  const testMap = new Map()
  const testSet = new Set()

  testMap.set('key-1', testSet)
  const ts1 = testMap.get('key-1')
  ts1.add(testFnA)
  ts1.add(testFnB)
  // this is just for looking from debug
  for (const fn of ts1) {
    fn()
  }

  t.is(testMap.get('key-1').size, 2)
})

test('It should able to store multiple level within a class structure and act like a private property', t => {
  let ctn = 0
  const testFnB = () => {
    _debug(`call B ${++ctn}`)
  }

  const PRIVATE_STORE = new Map()
  class Dummy {

    add (item: unknown) {
      PRIVATE_STORE.set(this, item)
    }

    get() {
      return PRIVATE_STORE.get(this)
    }
  }

  const dummyIns = new Dummy()

  const mapA = new Map()
  const toAdd1 = new Set()
  mapA.set('a', toAdd1)
  let toAdd1a = mapA.get('a')
  toAdd1a.add(testFnB)
  toAdd1a.add(testFnB)
  dummyIns.add(mapA)

  const dummyValue1 = dummyIns.get()

  t.is( dummyValue1.get('a').size, 1 )
})

test('It should store one item if its adding different thing to the same key', t => {
  let ctn = 0;
  const testFnA = () => {
    debug(`call A ${++ctn}`)
  }
  const testFnB = () => {
    debug(`call B ${++ctn}`)
  }
  const PRIVATE_STORE = new Map()
  class Dummy {
    add (item: unknown) {
      PRIVATE_STORE.set(this, item)
    }
    get() {
      return PRIVATE_STORE.get(this)
    }
  }

  const dummyInstance = new Dummy()

  const mapA = new Map();
  mapA.set('key-1', testFnA)
  const mapB = new Map();
  mapB.set('key-2', testFnB)

  dummyInstance.add(mapA)
  dummyInstance.add(mapB)

  t.truthy( dummyInstance.get().has('key-2') )
})

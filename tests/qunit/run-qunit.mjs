
import runQunitSetup from './run-qunit-setup.mjs'
const config = {
  port: 0,
  webroot: [
    '/home/joel/Projects/gitee/to1source_event/tests/qunit/webroot',
    '/home/joel/Projects/gitee/to1source_event/tests/qunit/files'
  ],
  open: true,
  reload: true,
  testFilePattern: '*.qunit.js',
  baseDir: '/home/joel/Projects/gitee/to1source_event/tests'
}

runQunitSetup(config)


import runQunitSetup from './run-qunit-setup.js'
import { join } from 'path'

const base = join(process.cwd(), 'tests')
const qunitDir = join(base, 'qunit')

const config = {
  port: 0,
  webroot: [
    join(qunitDir, 'webroot'),
    join(qunitDir, 'files')
  ],
  open: true,
  reload: true,
  testFilePattern: '*.qunit.js',
  baseDir: base
}

runQunitSetup(config)

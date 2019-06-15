/**
 * rollup config for build browser version
 */
import { join } from 'path'

import buble from 'rollup-plugin-buble'
import { terser } from 'rollup-plugin-terser'

const env = process.env.NODE_ENV;
const base = join(__dirname)
const outDir = join(base, 'dist')

const inputFile = env === 'alias' ? join('src', 'alias.js') : 'index.js'
const outputFile = env === 'alias' ? 'nb-event-service.alias.js' : 'nb-event-service.js'

export default {
  input: join(base, inputFile),
  output: {
    name: 'NBEventService',
    file: join(outDir, outputFile),
    format: 'umd',
    sourcemap: true
  },
  plugins: [
    buble(),
    terser()
  ]
}

/**
 * rollup config for build browser version
 */
import { join } from 'path'

import buble from 'rollup-plugin-buble'
import { terser } from 'rollup-plugin-terser'

const env = process.env.NODE_ENV;
const target = process.env.TARGET;
const base = join(__dirname)
const outDir = join(base, 'dist')
// default
const inputFile = env === 'alias' ? 'alias.js' : 'index.js'
const outputFile = env === 'alias' ? `nb-event-service-alias.${target}.js` : `nb-event-service.${target}.js`

export default {
  input: join(base, inputFile),
  output: {
    name: 'NBEventService',
    file: join(outDir, outputFile),
    format: target,
    sourcemap: true
  },
  plugins: [
    buble(),
    terser()
  ]
}

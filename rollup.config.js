/**
 * rollup config for build browser / node version
 */
import { join } from 'path'

import buble from 'rollup-plugin-buble'
import { terser } from 'rollup-plugin-terser'
import size from 'rollup-plugin-bundle-size'

const env = process.env.NODE_ENV
const target = process.env.TARGET
const base = join(__dirname)
const outDir = join(base, 'dist')
// default
const inputFile = env === 'alias' ? 'alias.js' : 'index.js'
const outputFile = env === 'alias' ? (target === 'cjs' ? `alias.js` : 'to1source-event-alias.js') 
                                   : `to1source-event.${target}.js`

export default {
  input: join(base, inputFile),
  output: {
    name: 'To1sourceEvent',
    file: join(outDir, outputFile),
    format: target,
    sourcemap: true
  },
  plugins: [
    buble(),
    terser(),
    size()
  ]
}

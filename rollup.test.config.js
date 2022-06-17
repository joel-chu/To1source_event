/**
    This is only for building couple files for testing purpose
 */
import { join } from 'path'

import buble from 'rollup-plugin-buble'
import { terser } from 'rollup-plugin-terser'
import size from 'rollup-plugin-bundle-size'

const env = process.env.NODE_ENV
const target = process.env.TARGET
const base = join(__dirname)
const outDir = join(base, 'tests', 'fixtures')

export default [{
  input: join(base, 'src' ,'watch.mjs'),
  output: {
    file: join(outDir, 'watch.cjs'),
    format: 'cjs',
    sourcemap: false
  },
  plugins: [
    buble(),
    terser(),
    size()
  ]
}, {
  input: join(base, 'src' ,'utils.mjs'),
  output: {
    file: join(outDir, 'utils.cjs'),
    format: 'cjs',
    sourcemap: false
  },
  plugins: [
    buble(),
    terser(),
    size()
  ]
}]

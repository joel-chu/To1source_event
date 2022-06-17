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
const outDir = join(base, 'dist')

const plugins = [
  buble(),
  terser(),
  size()
]

export default [{
  input: join(base, 'index.mjs'),
  output: [{
    file: join(outDir, 'to1source-event.cjs'),
    format: 'cjs',
    sourcemap: true,
    exports: 'default'
  }, {
    file: join(outDir, 'to1source-event.js'),
    format: 'umd',
    sourcemap: true,
    name: 'To1sourceEvent',
    exports: 'default'
  }],
  plugins
}, {
  input: join(base, 'alias.mjs'),
  output: [{
    file: join(outDir, 'alias.cjs'),
    format: 'cjs',
    sourcemap: true,
    exports: 'default'
  },{
    file: join(outDir, 'alias.js'),
    format: 'umd',
    name: 'To1sourceEvent',
    sourcemap: true,
    exports: 'default'
  }],
  plugins
}]

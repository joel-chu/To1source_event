/**
 * rollup config for build browser version
 */
import { join } from 'path'

import buble from 'rollup-plugin-buble'
import { terser } from 'rollup-plugin-terser'

const env = process.env.NODE_ENV;

export default {
  input: join(__dirname, 'index.js'),
  output: {
    name: 'NBEventService',
    file: join(__dirname, 'dist', 'nb-event-service.js'),
    format: 'umd',
    sourcemap: true
  },
  plugins: [
    buble(),
    terser()
  ]
}

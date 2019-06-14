/**
 * rollup config for build browser version
 */
import buble from 'rollup-plugin-buble'
import { terser } from 'rollup-plugin-terser'

const env = process.env.NODE_ENV;

export default {
  input: join(__dirname, 'index.js'),
  output: {
    name: 'NBEventService',
    file: join(__dirname, 'dist', 'nb-event-service.js'),
    format: 'umd',
    sourceMap: true,
  },
  plugins: [
    buble(),
    terser()
  ]
}

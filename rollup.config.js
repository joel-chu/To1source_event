/**
 * rollup config for build version
 *
 */


export default {
  	entry: 'src/nb-event-service.js',
  	dest: 'dist/nb-event-service.umd.js',
    exports: 'named',
    moduleName: 'NBEventService',
  	format: 'umd', // need to change to ?
  	plugins: [

  	]
};


const NBEventService = require('./src/cjs')
// try to get rip of that default shit
module.exports = NBEventService.default ? NBEventService.default : NBEventService

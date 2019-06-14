const serverIoCore = require('server-io-core')
const { join } = require('path')

serverIoCore({
  webroot: [
    join(__dirname),
    join(__dirname, '..', '..', 'dist')
  ]
})

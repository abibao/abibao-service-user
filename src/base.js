'use strict'

// node base.js base0 39000 127.0.0.1:39000,127.0.0.1:39001
// node base.js base1 39001 127.0.0.1:39000,127.0.0.1:39001

const TAG = process.env.TAG || process.argv[2] || 'base'
const PORT = process.env.PORT || process.argv[3] || 39999
const BASES = (process.env.BASES || process.argv[4] || '').split(',')

const seneca = require('seneca')({
  tag: TAG,
  debug: {short_logs: true}
})
  .use('mesh', {
    isbase: true,
    port: PORT,
    bases: BASES,
    pin: 'role:mesh'
  })
  .ready(() => {
    console.log('base is ready: ', seneca.id)
  })

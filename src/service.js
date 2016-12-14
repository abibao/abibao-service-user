'use strict'

const PORT = process.env.PORT || process.argv[2] || 0
const BASES = (process.env.BASES || process.argv[3] || '').split(',')

const path = require('path')
const handlebars = require('handlebars')
const hapi = require('hapi')
const vision = require('vision')
const inert = require('inert')
const Seneca = require('seneca')

const server = new hapi.Server()

server.connection({
  port: PORT
})

/*
PLUGIN
*/
server.register(vision)
server.register(inert)
server.register({
  register: require('chairo'),
  options: {
    seneca: Seneca({
      tag: 'user',
      internal: {logger: require('seneca-pino-logger')({level: 'info'})},
      debug: {short_logs: true}
    })
  }
})
server.register({
  register: require('wo'),
  options: {
    bases: BASES,
    route: [
      {path: '/user/homepage'},
      {path: '/user/api/ping'}
    ],
    sneeze: {
      silent: false
    }
  }
})

/*
STATIC
*/
server.views({
  engines: {html: handlebars},
  path: path.resolve(__dirname, 'www'),
  layout: true
})
server.route({
  method: 'GET',
  path: '/assets/{path*}',
  handler: {
    directory: {
      path: path.resolve(__dirname, 'www/assets')
    }
  }
})
server.route({
  method: 'GET',
  path: '/user/homepage',
  handler: (request, reply) => {
    reply.view('homepage', {
    })
  }
})

/*
API
*/
server.route({
  method: 'GET',
  path: '/user/api/ping',
  handler: (request, reply) => {
    server.seneca.act('role:api,cmd:ping', (err, out) => {
      reply(err || out)
    })
  }
})

/*
SENECA
*/
server.seneca
  .add('role:api,cmd:ping', (msg, done) => {
    done(null, {pong: true, api: true, time: Date.now()})
  })
  .use('mesh', {bases: BASES})

/*
start
*/
server.start(() => {
  console.log('abibao-service-user is ready: ', server.info.host, server.info.port)
})

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
PLUGINS
*/
server.register(vision)
server.register(inert)
server.register({
  register: require('chairo'),
  options: {
    seneca: Seneca({
      tag: 'home',
      debug: {short_logs: true}
    })
  }
})
server.register({
  register: require('wo'),
  options: {
    bases: BASES,
    route: [
      {path: '/api/ping'}
    ],
    sneeze: {
      silent: false
    }
  }
})

/*
STATICS
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
  path: '/home',
  handler: (request, reply) => {
    reply.view('home', {
    })
  }
})

/*
APIS
*/
server.route({
  method: 'GET',
  path: '/api/ping',
  handler: (request, reply) => {
    server.seneca.act('role:api,cmd:ping', (err, out) => {
      reply(err || out)
    })
  }
})

/*
SERVICES
*/
server.seneca
  .add('role:api,cmd:ping', (msg, done) => {
    done(null, {pong: true, api: true, time: Date.now()})
  })
  .use('mesh', {bases: BASES})

server.start(() => {
  console.log('abibao-service-user is ready: ', server.info.host, server.info.port)
})

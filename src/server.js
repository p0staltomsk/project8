// server.js
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = express()
  const httpServer = http.createServer(server)
  const io = new Server(httpServer)

  io.on('connection', (socket) => {
    console.log('A user connected')

    socket.on('codeChange', (data) => {
      socket.broadcast.emit('codeChange', data)
    })

    socket.on('disconnect', () => {
      console.log('User disconnected')
    })
  })

  server.all('*', (req, res) => {
    return handle(req, res)
  })

  httpServer.listen(3000, (err) => {
    if (err) throw err
    console.log('> Ready on http://localhost:3000')
  })
})
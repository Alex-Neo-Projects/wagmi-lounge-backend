import express from 'express'
import { createServer } from 'http'
import { randomUUID } from 'crypto'
import { Server } from 'socket.io'
const PORT = process.env.PORT || 3000

const app = express()

const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
  },
})

app.get('/', (req, res) => {
  res.send('hello')
})

let persons = {}
io.on('connection', (socket) => {
  console.log('connected!!!')

  // On connect, create a new entry for the person
  let uuid = randomUUID()
  let color = Math.floor(Math.random() * 255)
  const metadata = { uuid, color }
  persons[socket.id] = metadata

  // Get the cursor data and publishes to other clients
  socket.on('position', (data) => {
    const message = JSON.parse(data)

    persons[socket.id] = { ...persons[socket.id], x: message.x, y: message.y }

    io.sockets.emit('position', JSON.stringify(persons))
  })

  // Person disconnects
  socket.on('disconnect', (data) => {
    console.log('disconnected!')

    delete persons[socket.id]

    io.sockets.emit('remove', JSON.stringify(persons))
  })
})

server.listen(PORT, () => {
  console.log(`Listening on ${PORT}`)
})

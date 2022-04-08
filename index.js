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

let persons = new Map()
io.on('connection', (socket) => {
  console.log('connected!!!');

  // On connect, create a new entry for the person
  let uuid = randomUUID()
  let color = Math.floor(Math.random() * 255)
  const metadata = { uuid, color }
  persons.set(socket, metadata)

  // Get the cursor data and publishes to other clients
  socket.on('position', (data) => {
    const message = JSON.parse(data)
    const metadata = persons.get(socket)
    
    message.sender = metadata.uuid
    message.cursorColor = metadata.color

    io.sockets.emit('position', JSON.stringify(message))
  })

  // Person disconnects
  socket.on('disconnect', (data) => {
    console.log('disconnected!');
    const person = persons.get(socket)
    persons.delete(socket)
    io.sockets.emit('remove', JSON.stringify(person))
  })
})

server.listen(PORT, () => {
  console.log(`Listening on ${PORT}`)
})

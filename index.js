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

let images = ['https://lh3.googleusercontent.com/jJsUhpTNA_9CwMePUgJZamQW1IIHQgt3Hx1of8Y8EHhKqBsjHU9xb03S79xXzqLpGCVUX243N8dxYNkKaRcc51pFQh6bwZg5F8f-Ig', 'https://lh3.googleusercontent.com/bdECg069zBNQ-8uaxdTrNMdILTElSW4tSZ0zUFSrAuCAJOmqR6TKPigPrfk-ZAN6GS7mNWjuv3qGCxx2NGJ_3Zli9FCOdDvrxh10=w600', 'https://lh3.googleusercontent.com/IS4ySvhI8jGQsg_2fNFT3127JK61umYOGkulDrgVNxkBMeXz6acFjWjK1hmMBnMHPYnUq95NvmbBtUnfso8oR9GpRx_yL8L3w5lm=w600', 'https://lh3.googleusercontent.com/7h6yA2MwfeVC_k493JXGDbVetx7hlIFEohvflEBSVKH2C-OhEXvzUZdNcaAKWEMJMDZUFaljbHi2LzZg6busnhzi6fExqsgygAuEEA=w600'];

let persons = {}
io.on('connection', (socket) => {
  console.log('connected!!!')

  // On connect, create a new entry for the person
  let uuid = randomUUID()
  let color = Math.floor(Math.random() * 255)
  let image = Math.floor(Math.random() * 3)
  
  var currImage = images[image]; 
  const metadata = { uuid, color, currImage }
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

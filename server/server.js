import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import path from 'path'
import dotenv from 'dotenv'

import groupsRouter from './routes/groupsRoutes.js'
import suggestionsRouter from './routes/suggestionsRoutes.js'
import votesRouter from './routes/votesRoutes.js'
import usersRouter from './routes/usersRoutes.js'

dotenv.config()

const PORT = process.env.PORT || 3000

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : '*'
  }
})

app.use(express.json())

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('public'))
}

app.use('/api', groupsRouter)
app.use('/api', suggestionsRouter)
app.use('/api', votesRouter)
app.use('/api', usersRouter)

// Socket.io — real-time voting (stretch feature)
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.on('join-group', (groupId) => {
    socket.join(`group-${groupId}`)
    console.log(`Socket ${socket.id} joined group ${groupId}`)
  })

  socket.on('leave-group', (groupId) => {
    socket.leave(`group-${groupId}`)
  })

  socket.on('vote-cast', (data) => {
    // Broadcast vote update to all other clients in the group room
    socket.to(`group-${data.groupId}`).emit('vote-updated', data)
  })

  socket.on('suggestion-added', (data) => {
    socket.to(`group-${data.groupId}`).emit('suggestion-updated', data)
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

if (process.env.NODE_ENV === 'production') {
  app.get('/*', (_, res) =>
    res.sendFile(path.resolve('public', 'index.html'))
  )
}

httpServer.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})

export { io }

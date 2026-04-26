import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import path from 'path'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'

import groupsRouter from './routes/groupsRoutes.js'
import suggestionsRouter from './routes/suggestionsRoutes.js'
import votesRouter from './routes/votesRoutes.js'
import usersRouter from './routes/usersRoutes.js'
import moviesRouter from './routes/moviesRoutes.js'
import { pool } from './config/database.js'

dotenv.config()

const PORT = process.env.PORT || 3000
const isProd = process.env.NODE_ENV === 'production'

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: isProd ? false : 'http://localhost:5173',
    credentials: true
  }
})

app.use(express.json())
app.use(cookieParser())

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
})
app.use('/api/auth', authLimiter)

if (isProd) {
  app.use(express.static('public'))
}

app.use('/api', groupsRouter)
app.use('/api', suggestionsRouter)
app.use('/api', votesRouter)
app.use('/api', usersRouter)
app.use('/api', moviesRouter)

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: isProd })
  res.json({ message: 'Logged out' })
})

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

// Run any pending schema migrations before accepting traffic
async function runMigrations() {
  try {
    await pool.query(`
      ALTER TABLE groups ADD COLUMN IF NOT EXISTS voting_deadline TIMESTAMPTZ;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS github_id VARCHAR(255) UNIQUE;
      ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
      ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
    `)
    // Migrate TIMESTAMP → TIMESTAMPTZ if the column still has no timezone info
    await pool.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'groups'
            AND column_name = 'voting_deadline'
            AND data_type = 'timestamp without time zone'
        ) THEN
          ALTER TABLE groups
            ALTER COLUMN voting_deadline TYPE TIMESTAMPTZ
            USING voting_deadline AT TIME ZONE 'UTC';
        END IF;
      END $$;
    `)
    console.log('Migrations OK')
  } catch (err) {
    console.error('Migration error:', err.message)
  }
}

runMigrations().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`)
  })
})

export { io }

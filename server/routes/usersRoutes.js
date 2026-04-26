import express from 'express'
import { registerUser, loginUser, getAllUsers, getUserById, createUser, deleteUser, getMe, githubAuth, githubCallback } from '../controllers/usersController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.post('/auth/register', registerUser)
router.post('/auth/login', loginUser)
router.get('/auth/me', authMiddleware, getMe)
router.get('/auth/github', githubAuth)
router.get('/auth/github/callback', githubCallback)

router.get('/users', authMiddleware, getAllUsers)
router.get('/users/:id', authMiddleware, getUserById)
router.post('/users', createUser)
router.delete('/users/:id', authMiddleware, deleteUser)

export default router

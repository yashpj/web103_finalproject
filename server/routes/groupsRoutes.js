import express from 'express'
import {
  getUserGroups,
  getGroupById,
  createGroup,
  joinGroup,
  removeMember,
  deleteGroup,
  updateDeadline
} from '../controllers/groupsController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.get('/users/me/groups', authMiddleware, getUserGroups)
router.get('/groups/:id', authMiddleware, getGroupById)
router.post('/groups', authMiddleware, createGroup)
router.post('/groups/join', authMiddleware, joinGroup)
router.put('/groups/:id/deadline', authMiddleware, updateDeadline)
router.delete('/groups/:groupId/members/:userId', authMiddleware, removeMember)
router.delete('/groups/:id', authMiddleware, deleteGroup)

export default router

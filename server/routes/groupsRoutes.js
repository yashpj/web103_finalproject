import express from 'express'
import {
  getUserGroups,
  getGroupById,
  createGroup,
  joinGroup,
  removeMember,
  deleteGroup
} from '../controllers/groupsController.js'

const router = express.Router()

router.get('/users/:userId/groups', getUserGroups)
router.get('/groups/:id', getGroupById)
router.post('/groups', createGroup)
router.post('/groups/join', joinGroup)
router.delete('/groups/:groupId/members/:userId', removeMember)
router.delete('/groups/:id', deleteGroup)

export default router

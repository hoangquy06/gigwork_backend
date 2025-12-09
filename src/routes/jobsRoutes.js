const express = require('express')
const { authMiddleware } = require('../middleware/authMiddleware')
const { requireVerified } = require('../middleware/requireVerified')
const { asyncHandler } = require('../middleware/asyncHandler')
const ctrl = require('../controllers/jobsController')

const router = express.Router()

router.get('/api/jobs', asyncHandler(ctrl.list))
router.get('/api/jobs/:id', asyncHandler(ctrl.detail))
router.post('/api/jobs', authMiddleware, requireVerified, asyncHandler(ctrl.create))
router.patch('/api/jobs/:id', authMiddleware, requireVerified, asyncHandler(ctrl.update))
router.delete('/api/jobs/:id', authMiddleware, requireVerified, asyncHandler(ctrl.remove))
router.post('/api/jobs/:id/sessions', authMiddleware, requireVerified, asyncHandler(ctrl.addSession))
router.get('/api/jobs/:id/sessions', asyncHandler(ctrl.sessions))
router.post('/api/jobs/:id/skills', authMiddleware, requireVerified, asyncHandler(ctrl.addSkills))
router.get('/api/jobs/:id/location', asyncHandler(ctrl.getLocation))
router.patch('/api/jobs/:id/location', authMiddleware, requireVerified, asyncHandler(ctrl.updateLocation))

module.exports = router

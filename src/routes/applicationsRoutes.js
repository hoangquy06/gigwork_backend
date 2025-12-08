const express = require('express')
const { authMiddleware } = require('../middleware/authMiddleware')
const { requireVerified } = require('../middleware/requireVerified')
const { asyncHandler } = require('../middleware/asyncHandler')
const ctrl = require('../controllers/applicationsController')

const router = express.Router()

router.post('/api/applications', authMiddleware, requireVerified, asyncHandler(ctrl.apply))
router.post('/api/applications/accept', authMiddleware, requireVerified, asyncHandler(ctrl.accept))
router.post('/api/applications/reject', authMiddleware, requireVerified, asyncHandler(ctrl.reject))
router.post('/api/applications/complete', authMiddleware, requireVerified, asyncHandler(ctrl.complete))

module.exports = router

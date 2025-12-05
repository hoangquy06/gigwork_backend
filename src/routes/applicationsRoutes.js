const express = require('express')
const { authMiddleware } = require('../middleware/authMiddleware')
const { requireVerified } = require('../middleware/requireVerified')
const { asyncHandler } = require('../middleware/asyncHandler')
const ctrl = require('../controllers/applicationsController')

const router = express.Router()

router.post('/api/applications', authMiddleware, requireVerified, asyncHandler(ctrl.apply))
router.post('/api/applications/:id/accept', authMiddleware, requireVerified, asyncHandler(ctrl.accept))
router.post('/api/applications/:id/confirm', authMiddleware, requireVerified, asyncHandler(ctrl.confirm))
router.post('/api/applications/:id/complete', authMiddleware, requireVerified, asyncHandler(ctrl.complete))
router.post('/api/applications/:id/cancel', authMiddleware, requireVerified, asyncHandler(ctrl.cancel))

module.exports = router

const express = require('express')
const { authMiddleware } = require('../middleware/authMiddleware')
const { requireVerified } = require('../middleware/requireVerified')
const { asyncHandler } = require('../middleware/asyncHandler')
const ctrl = require('../controllers/notificationsController')

const router = express.Router()

router.get('/api/notifications', authMiddleware, requireVerified, asyncHandler(ctrl.list))

module.exports = router

const express = require('express')
const { authMiddleware } = require('../middleware/authMiddleware')
const { asyncHandler } = require('../middleware/asyncHandler')
const ctrl = require('../controllers/userController')

const router = express.Router()

router.get('/api/users/me', authMiddleware, asyncHandler(ctrl.me))
router.patch('/api/users/me', authMiddleware, asyncHandler(ctrl.updateMe))

module.exports = router

const express = require('express')
const { authMiddleware } = require('../middleware/authMiddleware')
const { requireVerified } = require('../middleware/requireVerified')
const { asyncHandler } = require('../middleware/asyncHandler')
const ctrl = require('../controllers/profilesController')

const router = express.Router()

router.post('/api/profiles/employee', authMiddleware, requireVerified, asyncHandler(ctrl.createEmployee))
router.patch('/api/profiles/employee', authMiddleware, requireVerified, asyncHandler(ctrl.updateEmployee))
router.post('/api/profiles/employer', authMiddleware, requireVerified, asyncHandler(ctrl.createEmployer))
router.patch('/api/profiles/employer', authMiddleware, requireVerified, asyncHandler(ctrl.updateEmployer))

module.exports = router

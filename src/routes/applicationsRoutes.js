const express = require('express')
const { authMiddleware } = require('../middleware/authMiddleware')
const { requireVerified } = require('../middleware/requireVerified')
const { asyncHandler } = require('../middleware/asyncHandler')
const ctrl = require('../controllers/applicationsController')

const router = express.Router()

router.get('/api/applications', authMiddleware, requireVerified, asyncHandler(ctrl.listMine))
router.get('/api/applications/:id', authMiddleware, requireVerified, asyncHandler(ctrl.getById))
router.post('/api/applications', authMiddleware, requireVerified, asyncHandler(ctrl.apply))
router.post('/api/applications/accept', authMiddleware, requireVerified, asyncHandler(ctrl.accept))
router.post('/api/applications/reject', authMiddleware, requireVerified, asyncHandler(ctrl.reject))
router.post('/api/applications/complete', authMiddleware, requireVerified, asyncHandler(ctrl.complete))
router.post('/api/applications/complete-paid', authMiddleware, requireVerified, asyncHandler(ctrl.completePaid))

module.exports = router

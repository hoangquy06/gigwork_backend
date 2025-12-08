const express = require('express')
const multer = require('multer')
const { authMiddleware } = require('../middleware/authMiddleware')
const { requireVerified } = require('../middleware/requireVerified')
const { asyncHandler } = require('../middleware/asyncHandler')
const ctrl = require('../controllers/profileImagesController')

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })
const router = express.Router()

router.post('/api/profiles/employee/image', authMiddleware, requireVerified, upload.single('file'), asyncHandler(ctrl.uploadEmployee))
router.get('/api/profiles/employee/image', authMiddleware, requireVerified, asyncHandler(ctrl.getEmployeePrimary))
router.post('/api/profiles/employee/image/:id/primary', authMiddleware, requireVerified, asyncHandler(ctrl.setEmployeePrimary))
router.delete('/api/profiles/employee/image/:id', authMiddleware, requireVerified, asyncHandler(ctrl.deleteImage))

router.post('/api/profiles/employer/image', authMiddleware, requireVerified, upload.single('file'), asyncHandler(ctrl.uploadEmployer))
router.get('/api/profiles/employer/image', authMiddleware, requireVerified, asyncHandler(ctrl.getEmployerPrimary))
router.post('/api/profiles/employer/image/:id/primary', authMiddleware, requireVerified, asyncHandler(ctrl.setEmployerPrimary))
router.delete('/api/profiles/employer/image/:id', authMiddleware, requireVerified, asyncHandler(ctrl.deleteImage))

module.exports = router

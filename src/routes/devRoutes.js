const express = require('express')
const { asyncHandler } = require('../middleware/asyncHandler')
const ctrl = require('../controllers/devController')

const router = express.Router()

router.post('/api/dev/seed-mock', asyncHandler(ctrl.seedMocks))
router.get('/api/dev/mocks', asyncHandler(ctrl.getMocks))

module.exports = router


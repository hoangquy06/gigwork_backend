"use strict";
const express = require('express');
const ctrl = require('../controllers/authController');
const { asyncHandler } = require('../middleware/asyncHandler');
const { authMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();
router.post('/api/auth/register', asyncHandler(ctrl.register));
router.post('/api/auth/login', asyncHandler(ctrl.login));
router.post('/api/auth/send-verification', authMiddleware, asyncHandler(ctrl.sendVerification));
router.get('/api/auth/verify-email', asyncHandler(ctrl.verifyEmail));
module.exports = router;
//# sourceMappingURL=authRoutes.js.map
"use strict";
const express = require('express');
const ctrl = require('../controllers/authController');
const { asyncHandler } = require('../middleware/asyncHandler');
const router = express.Router();
router.post('/api/auth/register', asyncHandler(ctrl.register));
router.post('/api/auth/login', asyncHandler(ctrl.login));
module.exports = router;
//# sourceMappingURL=authRoutes.js.map
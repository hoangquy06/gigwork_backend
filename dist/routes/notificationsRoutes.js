"use strict";
const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/asyncHandler');
const ctrl = require('../controllers/notificationsController');
const router = express.Router();
router.get('/api/notifications', authMiddleware, asyncHandler(ctrl.list));
module.exports = router;
//# sourceMappingURL=notificationsRoutes.js.map
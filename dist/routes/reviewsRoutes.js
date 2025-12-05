"use strict";
const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/asyncHandler');
const ctrl = require('../controllers/reviewsController');
const router = express.Router();
router.post('/api/reviews', authMiddleware, asyncHandler(ctrl.create));
router.get('/api/reviews/:userId', asyncHandler(ctrl.list));
module.exports = router;
//# sourceMappingURL=reviewsRoutes.js.map
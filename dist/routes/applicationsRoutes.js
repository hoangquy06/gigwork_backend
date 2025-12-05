"use strict";
const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/asyncHandler');
const ctrl = require('../controllers/applicationsController');
const router = express.Router();
router.post('/api/applications', authMiddleware, asyncHandler(ctrl.apply));
router.post('/api/applications/:id/accept', authMiddleware, asyncHandler(ctrl.accept));
router.post('/api/applications/:id/confirm', authMiddleware, asyncHandler(ctrl.confirm));
router.post('/api/applications/:id/complete', authMiddleware, asyncHandler(ctrl.complete));
router.post('/api/applications/:id/cancel', authMiddleware, asyncHandler(ctrl.cancel));
module.exports = router;
//# sourceMappingURL=applicationsRoutes.js.map
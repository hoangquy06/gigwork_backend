"use strict";
const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/asyncHandler');
const ctrl = require('../controllers/profilesController');
const router = express.Router();
router.post('/api/profiles/employee', authMiddleware, asyncHandler(ctrl.createEmployee));
router.patch('/api/profiles/employee', authMiddleware, asyncHandler(ctrl.updateEmployee));
router.post('/api/profiles/employer', authMiddleware, asyncHandler(ctrl.createEmployer));
router.patch('/api/profiles/employer', authMiddleware, asyncHandler(ctrl.updateEmployer));
module.exports = router;
//# sourceMappingURL=profilesRoutes.js.map
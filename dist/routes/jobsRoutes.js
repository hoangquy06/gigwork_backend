"use strict";
const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/asyncHandler');
const ctrl = require('../controllers/jobsController');
const router = express.Router();
router.get('/api/jobs', asyncHandler(ctrl.list));
router.get('/api/jobs/:id', asyncHandler(ctrl.detail));
router.post('/api/jobs', authMiddleware, asyncHandler(ctrl.create));
router.patch('/api/jobs/:id', authMiddleware, asyncHandler(ctrl.update));
router.delete('/api/jobs/:id', authMiddleware, asyncHandler(ctrl.remove));
router.post('/api/jobs/:id/sessions', authMiddleware, asyncHandler(ctrl.addSession));
router.get('/api/jobs/:id/sessions', asyncHandler(ctrl.sessions));
router.post('/api/jobs/:id/skills', authMiddleware, asyncHandler(ctrl.addSkills));
module.exports = router;
//# sourceMappingURL=jobsRoutes.js.map
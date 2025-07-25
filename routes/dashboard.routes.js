const express = require('express');
const router = express.Router();
const controller = require('../controllers/dashboard.controller');
const auth = require('../middlewares/auth.middleware');

// GET /api/dashboard/summary
router.get('/summary', auth, controller.getDashboardSummary);

module.exports = router;

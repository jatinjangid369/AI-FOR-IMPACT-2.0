const express = require('express');
const router = express.Router();
const { getPolicies, createPolicy } = require('../controllers/policiesController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, getPolicies);
router.post('/', authenticate, authorize('admin'), createPolicy);

module.exports = router;

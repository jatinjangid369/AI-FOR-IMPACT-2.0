const express = require('express');
const router = express.Router();
const {
  getMaintenanceRequests,
  createMaintenanceRequest,
  updateMaintenanceRequest,
} = require('../controllers/maintenanceController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getMaintenanceRequests);
router.post('/', authenticate, createMaintenanceRequest);
router.put('/:id', authenticate, updateMaintenanceRequest);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getComplaints,
  getComplaint,
  createComplaint,
  updateComplaint,
  deleteComplaint,
} = require('../controllers/complaintsController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, getComplaints);
router.get('/:id', authenticate, getComplaint);
router.post('/', authenticate, createComplaint);
router.put('/:id', authenticate, updateComplaint);
router.delete('/:id', authenticate, authorize('admin'), deleteComplaint);

module.exports = router;

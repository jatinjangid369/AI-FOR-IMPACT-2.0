const express = require('express');
const router = express.Router();
const {
  getLostItems,
  createLostItem,
  getFoundItems,
  createFoundItem,
} = require('../controllers/lostFoundController');
const { authenticate } = require('../middleware/auth');

router.get('/lost', authenticate, getLostItems);
router.post('/lost', authenticate, createLostItem);
router.get('/found', authenticate, getFoundItems);
router.post('/found', authenticate, createFoundItem);

module.exports = router;

const express = require('express');
const { protect, admin } = require('../middleware/authmiddaleware');
const { getOrders, addOrderItems, getMyOrders, updateOrderStatus } = require('../controllers/ordercontroller');

const router = express.Router();

router.route('/')
  .get(protect, admin, getOrders)
  .post(protect, addOrderItems);

router.route('/getmyorders').get(protect, getMyOrders);

router.route('/:id/status').put(protect, admin, updateOrderStatus);

module.exports = router;

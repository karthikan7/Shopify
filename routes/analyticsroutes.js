const express = require('express');
const { getAdminStats } = require('../controllers/analyticcontroller');
const { protect, admin } = require('../middleware/authmiddaleware');

const router = express.Router();

router.get('/', protect, admin, getAdminStats);

module.exports = router;

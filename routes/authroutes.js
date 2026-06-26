const express = require('express');
const { registeruser, loginuser, logoutuser, getusers } = require('../controllers/authcontrollers');
const { protect, admin } = require('../middleware/authmiddaleware');

const router = express.Router();

router.post('/register', registeruser);
router.post('/login',    loginuser);
router.post('/logout',   logoutuser);
router.get('/users',     protect, admin, getusers);

module.exports = router;

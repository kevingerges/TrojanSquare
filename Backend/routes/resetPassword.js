const express = require('express');
const router = express.Router();
const { resetPassword } = require('../src/controllers/resetPasswordController');

router.route('/').post(resetPassword);

module.exports = router;
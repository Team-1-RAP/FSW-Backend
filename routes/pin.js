const express = require('express');
const router = express.Router();
const pinController = require('../controllers/pinController');

router.post('/change-pin', pinController.changePin);

module.exports = router;

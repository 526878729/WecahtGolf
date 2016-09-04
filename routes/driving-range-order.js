/**
 * Created by qxj on 16/2/23.
 */
var express = require('express');
var router = express.Router();
var drivingRangeOrder = require('../controllers/driving-range-order');

router.get('/lastcontact', drivingRangeOrder.getLastDrivingRangeOrderContact);

module.exports = router;
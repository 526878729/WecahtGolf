/**
 * Created by qxj on 16/2/23.
 */
var express = require('express');
var router = express.Router();
var courseOrder = require('../controllers/course-order');

router.get('/lastcontact', courseOrder.getLastCourseOrderContact);

module.exports = router;
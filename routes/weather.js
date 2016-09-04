
/*** Created by Ryan on 16/1/11.*/


var express = require('express');
var router = express.Router();
var weather = require('../controllers/weather');

router.get('/', weather.getWeather);

module.exports = router;

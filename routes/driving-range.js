/**
 * Created by 2nd on 16/1/25.
 */
var express = require('express');
var router = express.Router();
var drivingRange = require('../controllers/driving-range');

var wechatCore = require('wechat-core');

router.get('/', function(req, res){
  var url = 'http://' + req.hostname + req.originalUrl.split('#')[0];
  return res.render('driving-range-search-input', {wechatConfig: wechatCore.getConfigForFrontPage(url)});
});

router.get('/search', drivingRange.search);

router.get('/names', drivingRange.getDrivingRangeNameList);

router.get('/recommended', drivingRange.getRecommendedDrivingRange);

router.get('/:id', drivingRange.getDrivingRange);

module.exports = router;
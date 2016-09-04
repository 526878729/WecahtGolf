/**
 * Created by 2nd on 16/1/10.
 */
var express = require('express');
var router = express.Router();
var course = require('../controllers/course');
var wechatCore = require('wechat-core');

router.get('/', function(req, res){
  var url = 'http://' + req.hostname + req.originalUrl.split('#')[0];
  return res.render('course-search-input', {wechatConfig: wechatCore.getConfigForFrontPage(url)});
});

router.get('/search', course.search);

router.get('/names', course.getCourseNameList);

router.get('/recommended', course.getRecommendedCourse);

router.get('/:id', course.getCourse);

module.exports = router;
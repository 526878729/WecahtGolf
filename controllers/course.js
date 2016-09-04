/**
 * Created by 2nd on 16/1/10.
 */

var moment = require('moment');
var wechatCore = require('wechat-core');
var Course = require('../models/course');
var Order = require('../models/order');
var CourseOrder = require('../models/course-order');
var convertor = require('../lib/convertor');
var URI = require('urijs');
var co = require('co');
var ORDERTYPE = require('../lib/enums').ORDERTYPE;

exports.search = function(req, res, next){
  var geospatial = convertor.convertGeospatialFromString(req.query.geospatial);

  if (!geospatial) {
    var err = new Error('Invalid Geospatial');
    err.status = 400;
    return next(err);
  }

  var date = req.query.date;
  var time = req.query.time;
  var now = moment();
  var diffFromNow = false;
  var diffFromMidNight = false;

  var searchQuery = [];

  if (date) {
    searchQuery.push('&date=' + date);
    if (time) {
      var datetime = date + ' ' + time;
      date = moment(datetime.toLowerCase(), 'YYYY-MM-DD hh:mm a');
    }else {
      date = moment(date, 'YYYY-MM-DD');
    }

    diffFromNow = date.diff(now, 'minutes');
  }

  if (time) {
    searchQuery.push('&time=' + time);
    time = moment('2000-01-01 ' + time.toLowerCase(), 'YYYY-MM-DD hh:mm a');
    diffFromMidNight = time.diff(moment('2000-01-01', 'YYYY-MM-DD'), 'minutes');
  }

  var courseName = req.query.name;

  var sort = req.query.sort;

  Course.searchByGeospatial(geospatial, diffFromNow, diffFromMidNight, courseName, sort).exec(function(err, courses){
    if(err){
      err.status = 400;
      return next(err);
    }

    var searchUrl = URI(req.originalUrl).removeQuery('sort');

    return res.render('course-search-result-list', {courses: courses, searchUrl: searchUrl.toString(), searchQuery: searchQuery.join(''), geospatial: geospatial});
  });
};

exports.getCourseNameList = function(req, res, next){
  Course.find({
    enabled: true
  }).select('name').exec(function(err, courses){
    if(err){
      return res.json(err);
    }

    return res.json(courses);
  });
};

exports.getCourse = function(req, res, next){
  Course.findOne({
    _id: req.params.id,
    enabled: true
  }).exec(function(err, course){
    if(err){
      err.status = 400;
      return next(err);
    }

    if(!course){
      var httpErr = new Error('Not Found');
      httpErr.status = 404;
      return next(httpErr);
    }

    var url = 'http://' + req.hostname + req.originalUrl.split('#')[0];
    var shareTitle = '到' + course.name + '去打高尔夫';
    var shareMessage = {
      title: shareTitle,
      desc: shareTitle,
      link: url,
      imgUrl: 'http://sugars.vicp.cc' + course.photos[0]
    };

    var wechatConfigForFrontPage = wechatCore.getConfigForFrontPage(url);

    return res.render('course-detail', {course: course, date: req.query.date, time: req.query.time, shareMessage: shareMessage, wechatConfig: wechatConfigForFrontPage});
  });
};

exports.getRecommendedCourse = function(req, res, next){
  var geospatial = convertor.convertGeospatialFromString(req.query.geospatial);

  if (!geospatial) {
    var err = new Error('Invalid Geospatial');
    err.status = 400;
    return res.json(err);
  }

  co(function *(){
    try{
      if(req.session.user) {
        var order = yield Order.findOne({
          userId: req.session.user._id,
          orderType: ORDERTYPE.COURSE_ORDER
        }).exec();

        var courseOrder = false;

        if (order) {
          courseOrder = yield CourseOrder.findOne({
            _id: order.realOrderId
          }).populate({
            path: 'courseId',
            select: 'name thumbnail fees'
          }).exec();
        }

        if (courseOrder) {
          return res.json(courseOrder.courseId);
        }
      }

      var courses = yield Course.searchByGeospatial(geospatial, false, false, false, 'dis').exec();
      if(courses.length > 0) {
        return res.json(courses[0]);
      }

      var httpErr = new Error('Not Found');
      httpErr.status = 404;
      return res.json(httpErr);
    }catch (e){
      throw e;
    }
  }).catch(function(err){
    err.status = 500;
    return res.json(err);
  });
};
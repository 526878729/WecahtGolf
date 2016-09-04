/**
 * Created by 2nd on 16/1/25.
 */

var moment = require('moment');
var wechatCore = require('wechat-core');
var DrivingRange = require('../models/driving-range');
var Order = require('../models/order');
var DrivingRangeOrder = require('../models/driving-range-order');
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

  var drivingRangeName = req.query.name;

  var sort = req.query.sort;

  DrivingRange.searchByGeospatial(geospatial, diffFromNow, diffFromMidNight, drivingRangeName, sort).exec(function(err, drivingRanges){
    if(err){
      err.status = 400;
      return next(err);
    }

    var searchUrl = URI(req.originalUrl).removeQuery('sort');

    return res.render('driving-range-search-result-list', {drivingRanges: drivingRanges, searchUrl: searchUrl.toString(), searchQuery: searchQuery.join(''), geospatial: geospatial});
  });
};

exports.getDrivingRangeNameList = function(req, res, next){
  DrivingRange.find({
    enabled: true
  }).select('name').exec(function(err, drivingRanges){
    if(err){
      return res.json(err);
    }

    return res.json(drivingRanges);
  });
};

exports.getDrivingRange = function(req, res, next){
  DrivingRange.findOne({
    _id: req.params.id,
    enabled: true
  }).exec(function(err, drivingRange){
    if(err){
      err.status = 400;
      return next(err);
    }

    if(!drivingRange){
      var httpErr = new Error('Not Found');
      httpErr.status = 404;
      return next(httpErr);
    }

    var url = 'http://' + req.hostname + req.originalUrl.split('#')[0];
    var shareTitle = '到' + drivingRange.name + '去打高尔夫';
    var shareMessage = {
      title: shareTitle,
      desc: shareTitle,
      link: url,
      imgUrl: 'http://sugars.vicp.cc' + drivingRange.photos[0]
    };

    var wechatConfigForFrontPage = wechatCore.getConfigForFrontPage(url);

    return res.render('driving-range-detail', {drivingRange: drivingRange, date: req.query.date, time: req.query.time, shareMessage: shareMessage, wechatConfig: wechatConfigForFrontPage });
  });
};

exports.getRecommendedDrivingRange = function(req, res, next){
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
          orderType: ORDERTYPE.DRIVING_RANGE
        }).exec();

        var drivingRangeOrder = false;

        if (order) {
          drivingRangeOrder = yield DrivingRangeOrder.findOne({
            _id: order.realOrderId
          }).populate({
            path: 'drivingRangeId',
            select: 'name thumbnail fees'
          }).exec();
        }

        if (drivingRangeOrder) {
          return res.json(drivingRangeOrder.drivingRangeId);
        }
      }

      var drivingRanges = yield DrivingRange.searchByGeospatial(geospatial, false, false, false, 'dis').exec();
      if(drivingRanges.length > 0) {
        return res.json(drivingRanges[0]);
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
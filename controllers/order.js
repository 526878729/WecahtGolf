/**
 * Created by Ryan on 16/1/12.
 */
var moment = require('moment');
var Order = require('../models/order');
var CourseOrder = require('../models/course-order');
var DrivingRangeOrder = require('../models/driving-range-order');
var co = require('co');
var Enums = require('../lib/enums');

exports.getUserOrders = function (req, res, next) {
  var userId = req.session.user._id;

//  userId = "569272ce6a507ea61a3de4c1";
//  userId = "5690a76eaa796962116afa6b";
//    userId = "5690a7de5d4f667a11af8f1f"; //观测者

  co(function *() {
    try {
      var orders = yield Order.find({userId:userId}).sort({creationDate: -1}).exec();
      res.render('user-order-list', {
        totalOrders:orders
      });
    } catch (e) {
      throw new Error('用户的订单有问题咯');
    }
  });
};

exports.payOrder = function (req, res, next) {
  var orderId = req.body.orderId;
  var userId = req.session.user._id;
  var data = {msg: ''};

  co(function *() {
    try {
      var order = yield Order.findOne({_id:orderId}).exec();
      var resStr = "paid";

      if(!order) {
        data.msg = 'order no existed';
        return res.send(data);
      } else if (userId != order.userId) {
        data.msg = 'It is not your order';
        return res.send(data);
      }

      if (order.orderType == Enums.ORDERTYPE.COURSE_ORDER) {
        var courseOrder = yield CourseOrder.findOne({_id: order.realOrderId}).exec();

        if(!courseOrder) {
          data.msg = 'error';
          return res.send(data);
        }

        if (courseOrder.state == Enums.ORDERSTATE.COMPLETE) {
          data.msg = 'error';
          return res.send(data);
        }

        /*
         order.state = Enums.ORDERSTATE.READY_TO_JOIN;

         if (courseOrder.state != Enums.ORDERSTATE.READY_TO_JOIN) {
         courseOrder.state = Enums.ORDERSTATE.READY_TO_JOIN;
         }

         courseOrder.paidNumOfPeople += 1;

         var requiredPaid = courseOrder.payType == 0 ? 1 : courseOrder.numberOfPeople;
         var requiredJoin = courseOrder.numberOfPeople;

         var joinIsComplete = requiredJoin == courseOrder.joinedNumPeople;
         var paidIsComplete = requiredPaid == courseOrder.paidNumOfPeople;

         if (joinIsComplete == true && paidIsComplete == true ) {
         order.state = Enums.ORDERSTATE.COMPLETE;
         courseOrder.state = Enums.ORDERSTATE.COMPLETE;
         resStr = "complete";
         }

         var newOrder = yield order.save();
         var newCourseOrder = yield courseOrder.save();

         if (newCourseOrder.state == Enums.ORDERSTATE.COMPLETE) {
         var newOrders = yield Order.update({realOrderId:order.realOrderId}, {$set: {
         state: Enums.ORDERSTATE.COMPLETE
         }},{multi:true}).exec();
         }
         */

        order.state = Enums.ORDERSTATE.COMPLETE;
        courseOrder.state = Enums.ORDERSTATE.COMPLETE;

        var newOrder = yield order.save();
        var newCourseOrder = yield courseOrder.save();

      } else if (order.orderType == Enums.ORDERTYPE.DRIVING_RANGE) {
        try {
          var drivingRangeOrder = yield DrivingRangeOrder.findOne({_id: order.realOrderId}).exec();
        } catch (e) {
          throw e;
        }

        //var resStr = 'paid';

        if (drivingRangeOrder.state == Enums.ORDERSTATE.COMPLETE) {
          data.msg = 'error';
          return res.send(data);
        }

        order.state = Enums.ORDERSTATE.COMPLETE;
        drivingRangeOrder.state = Enums.ORDERSTATE.COMPLETE;

        var newOrder = yield order.save();
        var newDrivingRangeOrder = yield drivingRangeOrder.save();

      }

      resStr = "complete";

      data.msg = resStr;
      res.send(data);

    } catch (e) {
      data.msg = 'query error : ' + e;
      res.send(data);
    }
  });
};

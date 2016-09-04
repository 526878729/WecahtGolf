/**
 * Created by qxj on 16/2/4.
 */
var wechatCore = require('wechat-core');
var wechatConfig = require('../config').wechatConfig;
var xml2js = require('xml2js');
var xmlBuilder = new xml2js.Builder({
  rootName: 'xml'
});
var co = require('co');
var Order = require('../models/order');
var LessonOrder = require('../models/lesson-order');
var CourseOrder = require('../models/course-order');
var DrivingRangeOrder = require('../models/driving-range-order');
var Commission = require('../models/commission');
var User = require('../models/user');
var Payment = require('../models/payment');
var ORDERSTATE = require('../lib/enums').ORDERSTATE;
var ORDERTYPE = require('../lib/enums').ORDERTYPE;
var Enums = require('../lib/enums');
var messageNotify = require('../services/message-notify');
var resultFAIL = xmlBuilder.buildObject({
  return_code: 'FAIL'
});

var resultSUCCESS = xmlBuilder.buildObject({
  return_code: 'SUCCESS',
  return_msg: 'OK'
});

exports.notify = function (req, res, next) {
  res.set('Content-Type', 'text/xml');
  var user = req.session.user;
  var data = req.body;

  data = wechatCore.removeCdata(data.xml);

  if (!wechatCore.verifySign(data) || data.return_code !== 'SUCCESS') {
    return res.send(resultFAIL);
  }

  if (data.result_code !== 'SUCCESS') {
    return res.send(resultSUCCESS);
  }
  var userWechatOpenId = data.openid;
  var orderId = data.out_trade_no;

  co(function *() {
    var order = false;

    try {
      var payment = yield Payment.findOne({
        orderId: orderId
      }).exec();

      order = yield Order.findOne({_id: orderId}).exec();

    } catch (err) {
      err.status = 500;
      throw err;
    }

    if (!order) {
      throw new Error('Order Not Found');
    }

    if (payment) {
      if (payment.status === data.result_code) {
        return res.send(resultSUCCESS);
      }

      payment.status = data.result_code;

      payment.notify.push({
        notify_id: data.transaction_id,
        notify_type: 'wechat',
        notify_time: new Date(),
        trade_status: data.result_code
      });
    } else {
      if (order.fees !== parseInt(data.total_fee) || wechatConfig.appid != data.appid) {
        throw new Error('Validate Fail');
      }

      payment = new Payment({
        orderId: orderId,
        product: order.orderType,
        type: 'wechat',
        tradeNo: data.transaction_id,
        status: data.result_code,
        detail: data,
        notify: [{
          notify_id: data.transaction_id,
          notify_type: 'wechat',
          notify_time: new Date(),
          trade_status: data.result_code
        }]
      });
    }

    try {
      var savedPayment = yield payment.save();
    } catch (e) {
      throw e;
    }

    if (!savedPayment) {
      throw new Error('Save Payment Fail');
    }

    order.payment = savedPayment.id;

    switch (order.orderType) {
      case ORDERTYPE.LESSON:
        /*
         try {
         var lessonOrder = yield LessonOrder.findOne({
         _id: order.realOrderId
         }).exec();
         } catch (e) {
         throw e;
         }

         lessonOrder.paidNumOfPeople = lessonOrder.paidNumOfPeople + 1; */
        order.state = ORDERSTATE.COMPLETE;
        order.stateLogs.push({
          state: ORDERSTATE.COMPLETE,
          description: 'pay_success_wechat',
          updateDate: new Date()
        });
        try {
          var lessonOrder = yield LessonOrder.findOne({
            _id: order.realOrderId
          }).exec();
        } catch (e) {
          throw e;
        }
        lessonOrder.state = ORDERSTATE.COMPLETE;
        lessonOrder.save();

        lessonOrder.paidNumOfPeople = lessonOrder.paidNumOfPeople + 1;

        //send paid lesson order wechat message and phone message
        var paidLessonOrder = {
          openId: userWechatOpenId,
          lessonOrderId: lessonOrder.referenceId,
          phoneNumber: lessonOrder.phoneNumber,
          order_id: order._id
        };
        messageNotify.paidLessonOrderSuccess(paidLessonOrder, function (err, res, body) {
        });

        //save commission information and send message to master when user are recommended
        if (user.refereeId) {
          try {
            var master = yield User.findOne({
              _id: user.refereeId
            }).exec();
          } catch (e) {
            throw e;
          }
          var commission = order.total * (master.commissionRate / 100);
          var masterOrder = new Commission({
            orderId: order._id,
            orderTitle: order.title,
            consumerId: order.userId,
            refereeId: user.refereeId,
            orderTotal: order.total,
            fees: commission,
            state: order.state,
            creationDate: order.creationDate
          });

          try {
            var savedMasterOrder = yield masterOrder.save();
          } catch (e) {
            throw e;
          }

          if (!savedMasterOrder) {
            throw new Error('Save masterOrder Fail');
          }

          var recommendOrder = {
            openId: master.wechatOpenId,
            orderId: lessonOrder.referenceId,
            phoneNumber: master.phoneNumber,
            nickname: master.nickname
          };
          messageNotify.recommendUserPaidSuccess(recommendOrder, function (err, res, body) {
          });
        }

        break;

      /*
       if(lessonOrder.isGroup){
       if(lessonOrder.paidNumOfPeople == lessonOrder.numberOfPeople){
       lessonOrder.state = ORDERSTATE.COMPLETE;
       lessonOrder.save();

       Order.update({
       realOrderId: lessonOrder.id
       }, {
       $set: {
       state: ORDERSTATE.COMPLETE
       },
       $push: {
       stateLogs: {
       state: ORDERSTATE.COMPLETE,
       description: 'complete_group',
       updateDate: new Date()
       }
       }
       }, {
       safe: false,
       multi: true
       }).exec();
       } else {
       order.state = ORDERSTATE.READY_TO_JOIN;
       order.stateLogs.push({
       state: ORDERSTATE.READY_TO_JOIN,
       description: 'pay_success_wechat',
       updateDate: new Date()
       });
       }
       } else {
       if(lessonOrder.numberOfPeople > 1){
       lessonOrder.state = ORDERSTATE.READY_TO_JOIN;
       order.state = ORDERSTATE.READY_TO_JOIN;
       order.stateLogs.push({
       state: ORDERSTATE.READY_TO_JOIN,
       description: 'pay_success_wechat',
       updateDate: new Date()
       });
       }else{
       lessonOrder.state = ORDERSTATE.COMPLETE;
       order.state = ORDERSTATE.COMPLETE;
       order.stateLogs.push({
       state: ORDERSTATE.COMPLETE,
       description: 'pay_success_wechat',
       updateDate: new Date()
       });
       }
       lessonOrder.save();
       }
       break;
       */
      case ORDERTYPE.COURSE_ORDER:
        try {
          var courseOrder = yield CourseOrder.findOne({_id: order.realOrderId}).exec();
        } catch (e) {
          throw e;
        }

        //var resStr = 'paid';

        if (courseOrder.state == Enums.ORDERSTATE.COMPLETE) {
          throw new Error('Order already completed');
        }

        /*order.state = Enums.ORDERSTATE.READY_TO_JOIN;

         if (courseOrder.state != Enums.ORDERSTATE.READY_TO_JOIN) {
         courseOrder.state = Enums.ORDERSTATE.READY_TO_JOIN;
         }

         courseOrder.paidNumOfPeople += 1;

         var requiredPaid = courseOrder.payType == 0 ? 1 : courseOrder.numberOfPeople;
         var requiredJoin = courseOrder.numberOfPeople;

         var joinIsComplete = requiredJoin == courseOrder.joinedNumPeople;
         var paidIsComplete = requiredPaid == courseOrder.paidNumOfPeople;

         if (joinIsComplete == true && paidIsComplete == true) {
         order.state = Enums.ORDERSTATE.COMPLETE;
         courseOrder.state = Enums.ORDERSTATE.COMPLETE;
         resStr = 'complete';
         }*/

        try {
          /*var newOrder = yield order.save();
           var newCourseOrder = yield courseOrder.save();

           if (newCourseOrder.state == Enums.ORDERSTATE.COMPLETE) {
           var newOrders = yield Order.update({realOrderId: order.realOrderId}, {
           $set: {
           state: Enums.ORDERSTATE.COMPLETE
           }
           }, {multi: true}).exec();
           }*/

          order.state = Enums.ORDERSTATE.COMPLETE;
          courseOrder.state = Enums.ORDERSTATE.COMPLETE;

          var newOrder = yield order.save();
          var newCourseOrder = yield courseOrder.save();

        } catch (e) {
          throw e;
        }

        //send paid course order template message and phone message
        var paidCourseOrder = {
          openId: userWechatOpenId,
          courseOrderId: courseOrder.referenceId,
          phoneNumber: courseOrder.phoneNumber,
          order_id: newOrder._id
        };
        messageNotify.paidCourseOrderSuccess(paidCourseOrder, function (err, res, body) {
        });

        if (user.refereeId) {
          try {
            var master = yield User.findOne({
              _id: user.refereeId
            }).exec();
          } catch (e) {
            throw e;
          }
          var commission = order.total * (master.commissionRate / 100);
          var masterOrder = new Commission({
            orderId: order._id,
            orderTitle: order.title,
            consumerId: order.userId,
            refereeId: user.refereeId,
            orderTotal: order.total,
            fees: commission,
            state: order.state,
            creationDate: order.creationDate
          });

          try {
            var savedMasterOrder = yield masterOrder.save();
          } catch (e) {
            throw e;
          }

          if (!savedMasterOrder) {
            throw new Error('Save masterOrder Fail');
          }

          var recommendOrder = {
            openId: master.wechatOpenId,
            orderId: lessonOrder.referenceId,
            phoneNumber: master.phoneNumber,
            nickname: master.nickname
          };
          messageNotify.recommendUserPaidSuccess(recommendOrder, function (err, res, body) {
          });
        }

        break;
      case ORDERTYPE.DRIVING_RANGE:
        try {
          var drivingRangeOrder = yield DrivingRangeOrder.findOne({_id: order.realOrderId}).exec();
        } catch (e) {
          throw e;
        }

        //var resStr = 'paid';

        if (drivingRangeOrder.state == Enums.ORDERSTATE.COMPLETE) {
          throw new Error('Order already completed');
        }

        /*order.state = Enums.ORDERSTATE.READY_TO_JOIN;

         if (drivingRangeOrder.state != Enums.ORDERSTATE.READY_TO_JOIN) {
         drivingRangeOrder.state = Enums.ORDERSTATE.READY_TO_JOIN;
         }

         drivingRangeOrder.paidNumOfPeople += 1;

         var requiredPaid = drivingRangeOrder.payType == 0 ? 1 : drivingRangeOrder.numberOfPeople;
         var requiredJoin = drivingRangeOrder.numberOfPeople;

         var joinIsComplete = requiredJoin == drivingRangeOrder.joinedNumPeople;
         var paidIsComplete = requiredPaid == drivingRangeOrder.paidNumOfPeople;

         if (joinIsComplete == true && paidIsComplete == true) {
         order.state = Enums.ORDERSTATE.COMPLETE;
         drivingRangeOrder.state = Enums.ORDERSTATE.COMPLETE;
         resStr = 'complete';
         }*/

        try {
          /*var newOrder = yield order.save();
           var newDrivingRangeOrder = yield drivingRangeOrder.save();

           if (newDrivingRangeOrder.state == Enums.ORDERSTATE.COMPLETE) {
           var newOrders = yield Order.update({realOrderId: order.realOrderId}, {
           $set: {
           state: Enums.ORDERSTATE.COMPLETE
           }
           }, {multi: true}).exec();
           }*/

          order.state = Enums.ORDERSTATE.COMPLETE;
          drivingRangeOrder.state = Enums.ORDERSTATE.COMPLETE;

          var newOrder = yield order.save();
          var newDrivingRangeOrder = yield drivingRangeOrder.save();

        } catch (e) {
          throw e;
        }

        //send paid drivingrange order template message and phone message
        var paidDrivingRangeOrder = {
          openId: userWechatOpenId,
          drivingRangeOrderId: drivingRangeOrder.referenceId,
          phoneNumber: drivingRangeOrder.phoneNumber,
          order_id: order._id
        };
        messageNotify.paidDrivingRangeOrderSuccess(paidDrivingRangeOrder, function (err, res, body) {
        });

        if (user.refereeId) {
          try {
            var master = yield User.findOne({
              _id: user.refereeId
            }).exec();
          } catch (e) {
            throw e;
          }
          var commission = order.total * (master.commissionRate / 100);
          var masterOrder = new Commission({
            orderId: order._id,
            orderTitle: order.title,
            consumerId: order.userId,
            refereeId: user.refereeId,
            orderTotal: order.total,
            fees: commission,
            state: order.state,
            creationDate: order.creationDate
          });

          try {
            var savedMasterOrder = yield masterOrder.save();
          } catch (e) {
            throw e;
          }

          if (!savedMasterOrder) {
            throw new Error('Save masterOrder Fail');
          }

          var recommendOrder = {
            openId: master.wechatOpenId,
            orderId: lessonOrder.referenceId,
            phoneNumber: master.phoneNumber,
            nickname: master.nickname
          };
          messageNotify.recommendUserPaidSuccess(recommendOrder, function (err, res, body) {
          });
        }

        break;
      default:
        break;
    }

    try {
      var savedOrder = yield order.save();
    } catch (e) {
      throw e;
    }

    if (!savedOrder) {
      throw new Error('Save Order Fail');
    }

    return res.send(resultSUCCESS);
  }).catch(function (err) {
    console.log(err.message);
    return res.send(resultFAIL);
  });
};
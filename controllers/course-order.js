/**
 * Created by Ryan on 16/1/12.
 */
var moment = require('moment');
var wechatCore = require('wechat-core');
var parseXML2String = require('xml2js').parseString;
var CourseOrder = require('../models/course-order');
var Course = require('../models/course');
var Order = require('../models/order');
var User = require('../models/user');
var co = require('co');
var Enums = require('../lib/enums');
var messageNotify = require('../services/message-notify');

exports.getCourseOrderPage = function (req, res, next) {
  res.render('course-order', {});
};

exports.addCourseOrder = function (req, res, next) {
  var userId = req.session.user._id;
  var courseId = req.body.courseId;
  var date = req.body.date;
  var time = req.body.time;
  var name = req.body.name;
  var phoneNumber = req.body.phoneNumber;
  var noOfPeople = req.body.numberOfPeople;
  var message = req.body.message;
  var total = req.body.total;
  var state = Enums.ORDERSTATE.WAITTING_TO_COMFIRM;
  var payType = req.body.payType;
  var historyName = name;
  var historyPhoneNumber = phoneNumber;

  var now = moment();
  var diffFromNow = false;
  var diffFromMidNight = false;

  var datetime = date + ' ' + time;
  date = moment(datetime.toLowerCase(), 'YYYY-MM-DD hh:mm a');

  diffFromNow = date.diff(now, 'minutes');

  time = moment('2000-01-01 ' + time.toLowerCase(), 'YYYY-MM-DD hh:mm a');
  diffFromMidNight = time.diff(moment('2000-01-01', 'YYYY-MM-DD'), 'minutes');

  co(function * () {
      try {
        var course = yield Course.findOne({
          _id: courseId
        }).exec();
      } catch (e) {
        throw new Error('抱歉！您的网络不好请您重新提交。');
      }

      if (!course) {
        throw new Error('所选球场不可预定, 请选择其他球场。');
      }

      if (course.advanceReservationStart > diffFromNow || course.advanceReservationEnd < diffFromNow || course.teeTimesStart > diffFromMidNight || course.teeTimesEnd < diffFromMidNight) {
        throw new Error('所选时间不可预定, 请选择其他时间。');
      }

      var bookingDate = moment(datetime.toLowerCase(), 'YYYY-MM-DD hh:mm a');

      var newCourseOrder = new CourseOrder({
        ownerId: userId,
        courseId: courseId,
        courseName: course.name,
        coursePhoneNumber: course.phoneNumber,
        bookingDate: bookingDate,
        expiredDate: bookingDate,
        name: name,
        phoneNumber: phoneNumber,
        paidNumOfPeople: 0,
        joinedNumPeople: 1,
        numberOfPeople: noOfPeople,
        message: message,
        total: total,
        state: state,
        fees: course.fees,
        payType: payType
      });

      try {
        var savedCourseOrder = yield newCourseOrder.save();
        var courseOrder_id = savedCourseOrder._id;
        var totalFees = noOfPeople * course.fees;

        var newOrder = new Order({
          realOrderId: courseOrder_id,
          orderType: Enums.ORDERTYPE.COURSE_ORDER,
          userId: userId,
          ownerId: userId,
          title: course.name,
          numberOfPeople: noOfPeople,
          fees: course.fees,
          state: state,
          total: totalFees,
          thumbnail: course.thumbnail,
          photos: course.photos
        });

        var savedOrder = yield newOrder.save();

        //send wechat template message and phone message
        var order = {
          openId: req.session.user.wechatOpenId,
          courseOrderId: savedCourseOrder.referenceId,
          phoneNumber: phoneNumber,
          order_id: savedOrder._id
        };
        messageNotify.commitCourseOrderSuccess(order);

        return res.render('course-order-result', {result: true});
      } catch (e) {
        throw new Error('抱歉！您的网络不好请您重新提交。');
      }
    }
  ).
    catch(function (err) {
      return res.render('course-order-result', {result: false, error: err.message});
    });
};

exports.joinCourseOrder = function (req, res, next) {
  var userId = req.session.user._id;
  var courseOrderId = req.body.realOrderId;

  var data = {
    msg: '',
    orderId: ''
  };

//  userId = "569272ce6a507ea61a3de4c1";
//  userId = "5690a76eaa796962116afa6b";
//  userId = "5690a7de5d4f667a11af8f1f"; //观测者

  co(function * () {

      try {

        var courseOrder = yield CourseOrder.findOne({_id: courseOrderId}).exec();

        if (!courseOrder) {
          throw new Error('你的订单有问题,请联系客服');
        }

        if (courseOrder.joinedNumPeople == courseOrder.numberOfPeople) {
          data.msg = 'full';
          return res.send(data);
        } else if (courseOrder.state >= Enums.ORDERSTATE.READY_TO_JOIN) {
          var foundOrder = yield Order.findOne({userId: userId, realOrderId: courseOrderId}).exec();

          if (foundOrder) {
            data.msg = 'existed';
            return res.send(data);
          }
        }

        var course = yield Course.findOne({
          _id: courseOrder.courseId
        }).exec();

        if (!course) {
          throw new Error('你的订单有问题,请联系客服');
        }

        var courseOrder_id = courseOrder._id;
        var totalFees = courseOrder.numberOfPeople * courseOrder.fees;
        var resStr = "joinGroup";
        var newOrder = new Order({
          realOrderId: courseOrder_id,
          orderType: Enums.ORDERTYPE.COURSE_ORDER,
          userId: userId,
          ownerId: courseOrder.ownerId,
          title: courseOrder.courseName,
          numberOfPeople: courseOrder.numberOfPeople,
          fees: courseOrder.fees,
          state: Enums.ORDERSTATE.WAITTING_TO_PAY,
          total: totalFees,
          thumbnail: course.thumbnail,
          photos: course.photos
        });

        courseOrder.joinedNumPeople += 1;
        var joinIsComplete = courseOrder.numberOfPeople == courseOrder.joinedNumPeople;

        if (courseOrder.payType == 0 && courseOrder.paidNumOfPeople > 0 && joinIsComplete == true) {
          courseOrder.state = Enums.ORDERSTATE.COMPLETE;
          newOrder.state = Enums.ORDERSTATE.COMPLETE;
          resStr = "complete";
        }

        var savedOrder = yield newOrder.save();
        var savedCourseOrder = yield courseOrder.save();

        if (savedCourseOrder.state == Enums.ORDERSTATE.COMPLETE) {
          var newOrders = yield Order.update({realOrderId: courseOrderId}, {
            $set: {
              state: Enums.ORDERSTATE.COMPLETE
            }
          }, {multi: true}).exec();
        }

        data.msg = resStr;
        data.orderId = savedOrder._id.toString();

        return res.send(data);
      } catch (e) {
        data.msg = 'error';
        return res.send(data);
      }

    }
  ).
    catch(function (err) {
      data.msg = 'error';
      return res.send(data);
    });
};

exports.getCourseOrderDetail = function (req, res, next) {
  var orderId = req.params.id;
  var userId = req.session.user._id;

//  userId = "569272ce6a507ea61a3de4c1";
//    userId = "5690a76eaa796962116afa6b";
  //   userId = "5690a7de5d4f667a11af8f1f"; //观测者

  if (!orderId) {
    var httpErr = new Error('Not Found');
    httpErr.status = 404;
    return next(httpErr);
  }

  co(function * () {
      try {
        var order = yield Order.findOne({_id: orderId}).exec();
        var courseOrder = yield CourseOrder.findOne({_id: order.realOrderId}).exec();
      } catch (e) {
        e.status = 500;
        throw e;
      }

      if (courseOrder.ownerId.toString() != userId.toString() && courseOrder.state < Enums.ORDERSTATE.READY_TO_JOIN) {
        throw new Error('禁止访问次订单');
      }

      var isOwner = false;
      var bookingDate = moment(courseOrder.bookingDate).format('YYYY年MM月DD日 hh:mm a');
      var realBookingDate = moment(courseOrder.bookingDate).format('YYYY-MM-DD hh:mm:ss');
      var expiredDate = moment(courseOrder.expiredDate).format('YYYY-MM-DD hh:mm:ss');

      var orderState = Enums.ORDERSTATE.WAITTING_TO_COMFIRM;

      if (userId == order.userId) {
        orderState = order.state;
      }

      if (userId == courseOrder.ownerId) {
        isOwner = true;
      }

      var referenceId = order.userId == userId ? courseOrder.referenceId : 0;

      var orderDetail = {
        orderId: orderId,
        realOrderId: order.realOrderId,
        courseName: courseOrder.courseName,
        coursePhoneNumber: courseOrder.coursePhoneNumber,
        bookingDate: bookingDate,
        realBookingDate: realBookingDate,
        expiredDate: expiredDate,
        numberOfPeople: courseOrder.numberOfPeople,
        ownerName: courseOrder.name,
        courseOrderState: courseOrder.state,
        orderState: orderState,
        phoneNumber: courseOrder.phoneNumber,
        fees: courseOrder.fees,
        message: courseOrder.message,
        payType: courseOrder.payType,
        photos: order.photos,
        paidNumOfPeople: courseOrder.paidNumOfPeople,
        joinedNumPeople: courseOrder.joinedNumPeople,
        userList: [],
        refId: referenceId
      };

      var url = 'http://' + req.hostname + req.originalUrl.split('#')[0];
      var shareTitle = req.session.user.nickname + '邀请你一起去打高尔夫';
      var shareMessage = {
        title: shareTitle,
        desc: shareTitle,
        link: url,
        imgUrl: 'http://sugars.vicp.cc' + orderDetail.photos
      };

      var wechatConfigForFrontPage = wechatCore.getConfigForFrontPage(url);

      if (req.isFromWechat && order.state === Enums.ORDERSTATE.WAITTING_TO_PAY) {
        var payParams = {
          body: courseOrder.courseName,
          attach: 'course',
          out_trade_no: order.id,
          total_fee: courseOrder.fees,
          spbill_create_ip: req.headers['x-real-ip'],
          openid: req.session.wechat
        };

        try {
          var wpParams = yield new Promise(function (resolve, reject) {
            wechatCore.unifiedorder(payParams, function (err, response, result) {
              if (err || response.statusCode !== 200) {
                reject();
              }

              parseXML2String(result, function (xmlErr, wpResult) {
                if (!xmlErr) {
                  wpResult = wechatCore.removeCdata(wpResult.xml);
                  if (wechatCore.verifySign(wpResult) && wpResult.return_code === 'SUCCESS' && wpResult.result_code === 'SUCCESS') {
                    var wpParams = wechatCore.getJSAPIParamsByPrepayId(wpResult.prepay_id);
                    resolve(wpParams);
                  } else {
                    console.log(wpResult);
                    reject();
                  }
                }
                reject();
              });
            });
          });
        } catch (e) {
          console.log('wechatpay unifiedorder fail.');
          throw e;
        }

        getRenderPage(userId, isOwner, order, courseOrder, orderDetail, function (page) {
          return res.render(page, {
            orderDetail: orderDetail,
            isOwner: isOwner,
            wpParams: wpParams,
            wechatConfig: wechatConfigForFrontPage,
            shareMessage: shareMessage
          });
        });
      } else {
        getRenderPage(userId, isOwner, order, courseOrder, orderDetail, function (page) {
          return res.render(page, {
            orderDetail: orderDetail,
            isOwner: isOwner,
            wechatConfig: wechatConfigForFrontPage,
            shareMessage: shareMessage
          });
        });
      }

    }
  ).
    catch(function (err) {
      return next(err);
    });
};

exports.updateCourseOrder = function (req, res, next) {
  var orderId = req.body.orderId;
  var numberPeople = req.body.numberOfPeople;
  var ownerName = req.body.name;
  var phoneNumber = req.body.phoneNumber;
  var message = req.body.message;
  var payType = req.body.payType;
  var userId = req.session.user._id;

  var data = {
    msg: '',
    orderId: ''
  };

  co(function * () {
      try {
        var order = yield Order.findOne({
          _id: orderId
        }).exec();

        if (!order) {
          data.msg = '你的订单有问题,请联系客服';
          return res.send(data);
        } else if (order.userId != userId) {
          data.msg = '你没有修改的权限';
          return res.send(data);
        } else if (order.state >= Enums.ORDERSTATE.READY_TO_JOIN) {
          data.msg = '当前订单不能修改';
          return res.send(data);
        }

        order.numberOfPeople = numberPeople;
        order.state = Enums.ORDERSTATE.WAITTING_TO_COMFIRM;

        var savedOrder = yield order.save();

        var courseOrder = yield CourseOrder.findOne({
          _id: savedOrder.realOrderId
        }).exec();

        if (!courseOrder) {
          data.msg = '你的订单有问题,请联系客服';
          return res.send(data);
        }

        courseOrder.name = ownerName;
        courseOrder.numberOfPeople = numberPeople;
        courseOrder.phoneNumber = phoneNumber;
        courseOrder.state = Enums.ORDERSTATE.WAITTING_TO_COMFIRM;
        courseOrder.payType = payType;
        courseOrder.message = message;

        var newCourseOrder = yield courseOrder.save();

        data.msg = 'success';
        res.send(data);

      } catch (e) {
        data.msg = 'error';
        res.send(data);
      }
    }
  )
  ;
};

exports.cancelCourseOrder = function (req, res, next) {
  var orderId = req.body.orderId;
  var userId = req.session.user._id;

  var data = {
    msg: '',
    orderId: ''
  };

  co(function * () {
      try {
        var order = yield Order.findOne({
          _id: orderId
        }).exec();

        if (!order) {
          data.msg = '你的订单有问题,请联系客服';
          return res.send(data);
        } else if (order.userId != userId) {
          data.msg = '你没有修改的权限';
          return res.send(data);
        } else if (order.state >= Enums.ORDERSTATE.READY_TO_JOIN) {
          data.msg = '当前订单不能修改';
          return res.send(data);
        }

        var courseOrder = yield CourseOrder.findOne({
          _id: order.realOrderId
        }).exec();

        if (!courseOrder) {
          data.msg = '你的订单有问题,请联系客服';
          return res.send(data);
        }

        courseOrder.state = Enums.ORDERSTATE.USERCANCEL;

        var newCourseOrder = yield courseOrder.save();

        var newOrders = yield Order.update({realOrderId: order.realOrderId}, {
          $set: {
            state: Enums.ORDERSTATE.USERCANCEL
          }
        }, {multi: true}).exec();

        //send wechat template message and phone message when user cancel course order
        var order = {
          openId: req.session.user.wechatOpenId,
          courseOrderId: courseOrder.referenceId,
          phoneNumber: courseOrder.phoneNumber,
          order_id: newOrders._id
        };
        messageNotify.cancelCourseOrderSuccess(order);

        data.msg = 'success';
        res.send(data);

      } catch (e) {
        data.msg = 'error';
        res.send(data);
      }
    }
  )
  ;
};

function getRenderPage(userId, isOwner, order, courseOrder, orderDetail, callBack) {
  co(function * () {
      try {
        if (isOwner == true && order.userId == userId && order.state < Enums.ORDERSTATE.READY_TO_JOIN) {
          callBack('order-detail');
        } else {
          var orders = yield Order.find({realOrderId: order.realOrderId}).sort({creationDate: 1}).exec();

          for (var i = 0; i < orders.length; i++) {
            var t_order = orders[i];
            var t_userId = t_order.userId;
            var ownerId = t_order.ownerId;
            var user = yield User.findOne({_id: t_userId}).exec();

            var creationDate = moment(t_order.creationDate).format('YYYY-MM-DD hh:mm');
            var payState = "";
            var payType = courseOrder.payType;

            if (payType > 0) {
              payState = t_order.state < Enums.ORDERSTATE.READY_TO_JOIN ? "(未付款)" : "";
            }

            creationDate = creationDate + " 支付";


            var userDetail = {
              nickName: user.nickname,
              avatar: user.avatar,
              payState: payState,
              createDate: creationDate
            };

            orderDetail.userList.push(userDetail);
          }

          callBack('invite-friend');
        }
      } catch (e) {

      }
    }
  )
  ;
};

exports.getLastCourseOrderContact = function (req, res, next) {
  var userId = req.session.user._id;
  CourseOrder.findOne({
    ownerId: userId
  }, {
    name: true,
    phoneNumber: true
  }, {
    sort: {
      creationDate: -1
    }
  }).exec(function (err, order) {
    if (!err && order) {
      return res.json({
        name: order.name,
        phoneNumber: order.phoneNumber
      });
    }

    return res.json({});
  });
};

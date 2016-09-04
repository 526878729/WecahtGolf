/**
 * Created by 2nd on 16/2/14.
 */
var moment = require('moment');
var wechatCore = require('wechat-core');
var parseXML2String = require('xml2js').parseString;
var DrivingRangeOrder = require('../models/driving-range-order');
var DrivingRange = require('../models/driving-range');
var Order = require('../models/order');
var User = require('../models/user');
var co = require('co');
var Enums = require('../lib/enums');
var messageNotify = require('../services/message-notify');

exports.getDrivingRangeOrderPage = function (req, res, next) {
  res.render('driving-range-order', {});
};

exports.addDrivingRangeOrder = function (req, res, next) {
  var userId = req.session.user._id;
  var drivingRangeId = req.body.drivingRangeId;
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

  co(function *() {
    try {
      var drivingRange = yield DrivingRange.findOne({
        _id: drivingRangeId
      }).exec();
    } catch (e) {
      throw new Error('抱歉！您的网络不好请您重新提交。');
    }

    if (!drivingRange) {
      throw new Error('所选球场不可预定, 请选择其他球场。');
    }

    if (drivingRange.advanceReservationStart > diffFromNow || drivingRange.advanceReservationEnd < diffFromNow || drivingRange.teeTimesStart > diffFromMidNight || drivingRange.teeTimesEnd < diffFromMidNight) {
      throw new Error('所选时间不可预定, 请选择其他时间。');
    }

    var bookingDate = moment(datetime.toLowerCase(), 'YYYY-MM-DD hh:mm a');

    var newDrivingRangeOrder = new DrivingRangeOrder({
      ownerId: userId,
      drivingRangeId: drivingRangeId,
      drivingRangeName: drivingRange.name,
      drivingRangePhoneNumber: drivingRange.phoneNumber,
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
      fees: drivingRange.fees,
      payType: payType
    });

    try {
      var savedDrivingRangeOrder = yield newDrivingRangeOrder.save();
      var drivingRangeOrder_id = savedDrivingRangeOrder._id;
      var totalFees = noOfPeople * drivingRange.fees;

      var newOrder = new Order({
        realOrderId: drivingRangeOrder_id,
        orderType: Enums.ORDERTYPE.DRIVING_RANGE,
        userId: userId,
        ownerId: userId,
        title: drivingRange.name,
        numberOfPeople: noOfPeople,
        fees: drivingRange.fees,
        state: state,
        total: totalFees,
        thumbnail: drivingRange.thumbnail,
        photos: drivingRange.photos
      });

      var savedOrder = yield newOrder.save();

      //send wechat template message and phone message
      var order = {
        openId: req.session.user.wechatOpenId,
        drivingRangeOrderId: savedDrivingRangeOrder.referenceId,
        phoneNumber: phoneNumber,
        order_id: savedOrder._id
      };
      messageNotify.commitDrivingRangeOrderSuccess(order);

      return res.render('driving-range-order-result', {result: true});
    } catch (e) {
      throw new Error('抱歉！您的网络不好请您重新提交。');
    }
  }).catch(function (err) {
    return res.render('driving-range-order-result', {result: false, error: err.message});
  });
};

exports.joinDrivingRangeOrder = function (req, res, next) {
  var userId = req.session.user._id;
  var drivingRangeOrderId = req.body.realOrderId;

  var data = {
    msg: '',
    orderId: ''
  };

//  userId = "569272ce6a507ea61a3de4c1";
//  userId = "5690a76eaa796962116afa6b";
//  userId = "5690a7de5d4f667a11af8f1f"; //观测者

  co(function *() {

    try {

      var drivingRangeOrder = yield DrivingRangeOrder.findOne({_id: drivingRangeOrderId}).exec();

      if (!drivingRangeOrder) {
        throw new Error('你的订单有问题,请联系客服');
      }

      if (drivingRangeOrder.joinedNumPeople == drivingRangeOrder.numberOfPeople) {
        data.msg = 'full';
        return res.send(data);
      } else if (drivingRangeOrder.state >= Enums.ORDERSTATE.READY_TO_JOIN) {
        var foundOrder = yield Order.findOne({userId: userId, realOrderId: drivingRangeOrderId}).exec();

        if (foundOrder) {
          data.msg = 'existed';
          return res.send(data);
        }
      }

      var drivingRange = yield DrivingRange.findOne({
        _id: drivingRangeOrder.drivingRangeId
      }).exec();

      if (!drivingRange) {
        throw new Error('你的订单有问题,请联系客服');
      }

      var drivingRangeOrder_id = drivingRangeOrder._id;
      var totalFees = drivingRangeOrder.numberOfPeople * drivingRangeOrder.fees;
      var resStr = "joinGroup";
      var newOrder = new Order({
        realOrderId: drivingRangeOrder_id,
        orderType: Enums.ORDERTYPE.DRIVING_RANGE,
        userId: userId,
        ownerId: drivingRangeOrder.ownerId,
        title: drivingRangeOrder.drivingRangeName,
        numberOfPeople: drivingRangeOrder.numberOfPeople,
        fees: drivingRangeOrder.fees,
        state: Enums.ORDERSTATE.WAITTING_TO_PAY,
        total: totalFees,
        thumbnail: drivingRange.thumbnail,
        photos: drivingRange.photos
      });

      drivingRangeOrder.joinedNumPeople += 1;
      var joinIsComplete = drivingRangeOrder.numberOfPeople == drivingRangeOrder.joinedNumPeople;

      if (drivingRangeOrder.payType == 0 && drivingRangeOrder.paidNumOfPeople > 0 && joinIsComplete == true) {
        drivingRangeOrder.state = Enums.ORDERSTATE.COMPLETE;
        newOrder.state = Enums.ORDERSTATE.COMPLETE;
        resStr = "complete";
      }

      var savedOrder = yield newOrder.save();
      var savedDrivingRangeOrder = yield drivingRangeOrder.save();

      if (savedDrivingRangeOrder.state == Enums.ORDERSTATE.COMPLETE) {
        var newOrders = yield Order.update({realOrderId: drivingRangeOrderId}, {
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

  }).catch(function (err) {
    data.msg = 'error';
    return res.send(data);
  });
};

exports.getDrivingRangeOrderDetail = function (req, res, next) {
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
      var drivingRangeOrder = yield DrivingRangeOrder.findOne({_id: order.realOrderId}).exec();
    } catch (e) {
      e.status = 500;
      throw e;
    }

    if (drivingRangeOrder.ownerId.toString() != userId.toString() && drivingRangeOrder.state < Enums.ORDERSTATE.READY_TO_JOIN) {
      throw new Error('禁止访问次订单');
    }

    var isOwner = false;
    var bookingDate = moment(drivingRangeOrder.bookingDate).format('YYYY年MM月DD日 hh:mm a');
    var realBookingDate = moment(drivingRangeOrder.bookingDate).format('YYYY-MM-DD hh:mm:ss');
    var expiredDate = moment(drivingRangeOrder.expiredDate).format('YYYY-MM-DD hh:mm:ss');

    var orderState = Enums.ORDERSTATE.WAITTING_TO_COMFIRM;

    if (userId == order.userId) {
      orderState = order.state;
    }

    if (userId == drivingRangeOrder.ownerId) {
      isOwner = true;
    }

    var referenceId = order.userId == userId ? drivingRangeOrder.referenceId : 0;

    var orderDetail = {
      orderId: orderId,
      realOrderId: order.realOrderId,
      drivingRangeName: drivingRangeOrder.drivingRangeName,
      drivingRangePhoneNumber: drivingRangeOrder.drivingRangePhoneNumber,
      bookingDate: bookingDate,
      realBookingDate: realBookingDate,
      expiredDate: expiredDate,
      numberOfPeople: drivingRangeOrder.numberOfPeople,
      ownerName: drivingRangeOrder.name,
      drivingRangeOrderState: drivingRangeOrder.state,
      orderState: orderState,
      phoneNumber: drivingRangeOrder.phoneNumber,
      fees: drivingRangeOrder.fees,
      message: drivingRangeOrder.message,
      payType: drivingRangeOrder.payType,
      photos: order.photos,
      paidNumOfPeople: drivingRangeOrder.paidNumOfPeople,
      joinedNumPeople: drivingRangeOrder.joinedNumPeople,
      userList: [],
      refId: referenceId
    };

    var url = 'http://' + req.hostname + req.originalUrl.split('#')[0];
    var shareTitle = req.session.user.nickname + '邀请你一起去打高尔夫';
    var shareMessage = {
      title: shareTitle,
      desc: shareTitle,
      link: url,
      imgUrl: 'http://gaoshougolf.com' + orderDetail.photos
    };

    var wechatConfigForFrontPage = wechatCore.getConfigForFrontPage(url);

    if (req.isFromWechat && order.state === Enums.ORDERSTATE.WAITTING_TO_PAY) {
      var payParams = {
        body: drivingRangeOrder.drivingRangeName,
        attach: 'driving-range',
        out_trade_no: order.id,
        total_fee: drivingRangeOrder.fees,
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

      getRenderPage(userId, isOwner, order, drivingRangeOrder, orderDetail, function (page) {
        return res.render(page, {
          orderDetail: orderDetail,
          isOwner: isOwner,
          wpParams: wpParams,
          wechatConfig: wechatConfigForFrontPage,
          shareMessage: shareMessage
        });
      });
    } else {
      getRenderPage(userId, isOwner, order, drivingRangeOrder, orderDetail, function (page) {
        return res.render(page, {
          orderDetail: orderDetail,
          isOwner: isOwner,
          wechatConfig: wechatConfigForFrontPage,
          shareMessage: shareMessage
        });
      });
    }

  }).catch(function (err) {
    return next(err);
  });
};

exports.updateDrivingRangeOrder = function (req, res, next) {
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
      ;

      var savedOrder = yield order.save();

      var drivingRangeOrder = yield DrivingRangeOrder.findOne({
        _id: savedOrder.realOrderId
      }).exec();

      if (!drivingRangeOrder) {
        data.msg = '你的订单有问题,请联系客服';
        return res.send(data);
      }

      drivingRangeOrder.name = ownerName;
      drivingRangeOrder.numberOfPeople = numberPeople;
      drivingRangeOrder.phoneNumber = phoneNumber;
      drivingRangeOrder.state = Enums.ORDERSTATE.WAITTING_TO_COMFIRM;
      drivingRangeOrder.payType = payType;
      drivingRangeOrder.message = message;

      var newDrivingRangeOrder = yield drivingRangeOrder.save();

      data.msg = 'success';
      res.send(data);

    } catch (e) {
      data.msg = 'error';
      res.send(data);
    }
  });
};

exports.cancelDrivingRangeOrder = function (req, res, next) {
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

      var drivingRangeOrder = yield DrivingRangeOrder.findOne({
        _id: order.realOrderId
      }).exec();

      if (!drivingRangeOrder) {
        data.msg = '你的订单有问题,请联系客服';
        return res.send(data);
      }

      drivingRangeOrder.state = Enums.ORDERSTATE.USERCANCEL;

      var newDrivingRangeOrder = yield drivingRangeOrder.save();

      var newOrders = yield Order.update({realOrderId: order.realOrderId}, {
        $set: {
          state: Enums.ORDERSTATE.USERCANCEL
        }
      }, {multi: true}).exec();

      //send wechat template message and phone message when user cancel drivingrange order
      var order = {
        openId: req.session.user.wechatOpenId,
        drivingRangeOrderId: drivingRangeOrder.referenceId,
        phoneNumber: drivingRangeOrder.phoneNumber,
        order_id: order._id
      };
      messageNotify.cancelDrivingRangeOrderSuccess(order);

      data.msg = 'success';
      res.send(data);

    } catch (e) {
      data.msg = 'error';
      res.send(data);
    }
  });
};

function getRenderPage(userId, isOwner, order, drivingRangeOrder, orderDetail, callBack) {
  co(function * () {
    try {
      if (isOwner == true && order.userId == userId && order.state < Enums.ORDERSTATE.READY_TO_JOIN) {
        callBack('driving-range-order-detail');
      } else {
        var orders = yield Order.find({realOrderId: order.realOrderId}).sort({creationDate: 1}).exec();

        for (var i = 0; i < orders.length; i++) {
          var t_order = orders[i];
          var t_userId = t_order.userId;
          var ownerId = t_order.ownerId;
          var user = yield User.findOne({_id: t_userId}).exec();

          var creationDate = moment(t_order.creationDate).format('YYYY-MM-DD hh:mm');
          var payState = "";
          var payType = drivingRangeOrder.payType;

          if (payType > 0) {
            payState = t_order.state < Enums.ORDERSTATE.READY_TO_JOIN ? "(未付款)" : "";
          }

          creationDate = creationDate + " 支付";

          /*if (t_userId.toString() == ownerId.toString()) {
           creationDate = creationDate + " 开团";
           } else {
           creationDate = creationDate + " 参团";
           }*/

          var userDetail = {
            nickName: user.nickname,
            avatar: user.avatar,
            payState: payState,
            createDate: creationDate
          };

          orderDetail.userList.push(userDetail);
        }

        callBack('driving-range-invite-friend');
      }
    } catch (e) {

    }
  });
}

exports.getLastDrivingRangeOrderContact = function (req, res, next) {
  var userId = req.session.user._id;
  DrivingRangeOrder.findOne({
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
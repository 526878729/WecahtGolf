/**
 * Created by qxj on 16/2/5.
 */
var util = require('util');
var moment = require('moment');
var co = require('co');
var wechatCore = require('wechat-core');
var parseXML2String = require('xml2js').parseString;
var Lesson = require('../models/lesson');
var LessonOrder = require('../models/lesson-order');
var LessonPromotion = require('../models/lesson-promotion');
var Order = require('../models/order');
var ORDERSTATE = require('../lib/enums').ORDERSTATE;
var ORDERTYPE = require('../lib/enums').ORDERTYPE;
var messageNotify = require('../services/message-notify');

exports.addLessonOrder = function (req, res, next) {

  req.checkBody({
    'lessonId': {
      notEmpty: true,
      errorMessage: 'Invalid Lesson'
    },
    'selectDate': {
      notEmpty: true,
      errorMessage: 'Invalid Date'
    },
    'selectTime': {
      notEmpty: true,
      errorMessage: 'Invalid Time'
    },
    'name': {
      notEmpty: true,
      errorMessage: 'Invalid Name'
    },
    'phoneNumber': {
      notEmpty: true,
      errorMessage: 'Invalid Phone Number'
    }
  });

  var errors = req.validationErrors();
  if (errors) {
    var err = new Error('There have been validation errors: ' + util.inspect(errors));
    err.status = 400;
    return next(err);
  }

  var lessonId = req.body.lessonId;
  var promotionId = req.body.promotionId;
  var selectDate = moment( req.body.selectDate.toLowerCase() + ' ' + req.body.selectTime, 'YYYY-MM-DD hh:mm a');
  var numberOfPeople = req.body.numberOfPeople;

  var userId = req.session.user._id;
  var payType = parseInt(req.body.payType);

  co(function *() {
    try {
      var lesson = yield Lesson.findOne({
        _id: lessonId,
        inStock: true
      }).exec();

      if (!lesson) {
        throw new Error('找不到课程。');
      }

      var promotion = null;
      var fees = lesson.fees;
      var lessonName = lesson.title;

      if (promotionId) {
        promotion = yield LessonPromotion.findOne({
          _id: promotionId,
          inStock: true
        }).exec();

        if (!promotion) {
          throw new Error('找不到课程体验。');
        }

        fees = promotion.fees;
        lessonName = lessonName + '(' + promotion.title + ')';

        selectDate = promotion.activityDate;
      }

      if (selectDate < moment(lesson.dateStart) || selectDate > moment(lesson.dateEnd)) {
        throw new Error('所选时间不可购买, 请选择其他时间。');
      }

      var orderPromotion = false;

      var newLessonOrder = new LessonOrder({
        ownerId: userId,
        lessonId: lesson._id,
        lessonName: lessonName,
        bookingDate: selectDate,
        name: req.body.name,
        phoneNumber: req.body.phoneNumber,
        numberOfPeople: numberOfPeople,
        paidNumOfPeople: 0,
        joinedNumPeople: 1,
        isGroup: false,
        message: req.body.message,
        total: fees * numberOfPeople,
        //state: ORDERSTATE.WAITTING_TO_COMFIRM,
        state: ORDERSTATE.WAITTING_TO_PAY,
        fees: lesson.fees,
        payType: payType
      });

      if (promotion) {
        newLessonOrder.promotionId = promotion._id;
        orderPromotion = true;
      }

      var savedLessonOrder = yield newLessonOrder.save();

      var newOrder = new Order({
        realOrderId: savedLessonOrder._id,
        orderType: ORDERTYPE.LESSON,
        userId: userId,
        ownerId: userId,
        title: lessonName,
        numberOfPeople: numberOfPeople,
        fees: fees,
        total: fees * numberOfPeople,
        promotion: orderPromotion,
        //state: ORDERSTATE.WAITTING_TO_COMFIRM,
        state: ORDERSTATE.WAITTING_TO_PAY,
        stateLogs:[{
          //state: ORDERSTATE.WAITTING_TO_COMFIRM,
          state: ORDERSTATE.WAITTING_TO_PAY,
          description: 'Create',
          updateDate: new Date()
        }],
        thumbnail: lesson.thumbnail,
        photos: lesson.photos
      });

      var savedOrder = yield newOrder.save();

      //send wechat template message and phone message
      var order = {
        openId: req.session.user.wechatOpenId,
        lessonOrderId: savedLessonOrder.referenceId,
        phoneNumber: savedLessonOrder.phoneNumber,
        order_id: savedOrder._id
      };
      messageNotify.commitLessonOrderSuccess(order);

      return res.redirect('/order/detail/lesson/' + savedOrder._id.valueOf());
    } catch (e) {
      throw e;
    }
  }).catch(function (err) {
    return res.render('course-order-result', {result: false, error: '抱歉！您的网络不好请您重新提交。'});
  });
};

exports.getLessonOrderDetail = function (req, res, next) {
  var orderId = req.params.id;
  var userId = req.session.user._id;

  co(function * () {
    try {
      var order = yield Order.findOne({_id:orderId}).exec();
      
      if(!order){
        var httpErr = new Error('Not Found');
        httpErr.status = 404;
        return next(httpErr);
      }

      var lessonOrder = yield LessonOrder.findOne({_id: order.realOrderId}).exec();
    } catch (e) {
      throw e;
    }
        
    var isOwner = userId.toString() === lessonOrder.ownerId.toString();
    
    if(!lessonOrder.isGroup && !isOwner){
      var forbidden = new Error('Forbidden');
      forbidden.status = 403;
      return next(forbidden);
    }
    
    var joinedOrders = [];
    var joinedUsers = [];
    
    if(lessonOrder.isGroup){
      try{
        if(!isOwner){
          order = yield Order.findOne({
            realOrderId: lessonOrder._id,
            userId: userId
          }).exec();
        }
        
        joinedOrders = yield Order.find({
          realOrderId: lessonOrder._id
        }).populate('userId').exec();
        
        if(joinedOrders){
          for(var i = 0; i < joinedOrders.length; i++){
            
            joinedUsers.push({
              nickName: joinedOrders[i].userId.nickname,
              avatar: joinedOrders[i].userId.avatar,
              payState: (joinedOrders[i].state === 2 || joinedOrders[i].state === 3)? '已付款' : '未付款',
              createDate: moment(joinedOrders[i].creationDate).format('YYYY年MM月DD日 hh:mm a')
            });
          }
        }
      } catch (e) {
        throw e;
      }
    }
        
    var isFull = joinedOrders.length === lessonOrder.numberOfPeople;

    var bookingDate = moment(lessonOrder.bookingDate).format('YYYY年MM月DD日 hh:mm a');    
    var expiredDate = moment(lessonOrder.bookingDate).format('YYYY-MM-DD hh:mm a');

    var orderDetail = {
      orderId: orderId,
      lessonName: lessonOrder.lessonName,
      bookingDate: bookingDate,
      expiredDate: expiredDate,
      numberOfPeople: lessonOrder.numberOfPeople,
      name: lessonOrder.name,
      state: lessonOrder.state,
      phoneNumber: parseInt(lessonOrder.phoneNumber),
      paidNumOfPeople: lessonOrder.paidNumOfPeople,
      joinedNumPeople: lessonOrder.joinedNumPeople,
      fees: lessonOrder.fees,
      total: lessonOrder.fees * lessonOrder.numberOfPeople,
      message: lessonOrder.message,
      payType: lessonOrder.payType,
      refId: lessonOrder.referenceId
    };
    
    if(!order){
      return res.render('lesson-order-detail-group',  {orderDetail: orderDetail, joined: false, isFull: isFull, isOwner: isOwner, joinedUsers: joinedUsers});
    }
    
    var payTotal = lessonOrder.payType === 0 ? order.total : order.fees;
    
    var wechatConfigForFrontPage = null;
    var shareMessage = null;
    
    if(isOwner){
      var url = 'http://' + req.hostname + req.originalUrl.split('#')[0];
      var shareTitle = req.session.user.nickname + '邀请你一起去体验:' + lessonOrder.lessonName;
      shareMessage = {
        title: shareTitle,
        desc: shareTitle,
        link: url,
        imgUrl: 'http://gaoshougolf.com' + order.thumbnail
      };
      wechatConfigForFrontPage = wechatCore.getConfigForFrontPage(url);
    }
    
    if(req.isFromWechat && order.state === ORDERSTATE.WAITTING_TO_PAY) {
      var payParams = {
        body: order.title,
        attach: 'lesson',
        out_trade_no: order.id,
        total_fee: payTotal,
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
      }catch (e){
        throw e;
      }
            
      if(!lessonOrder.isGroup){
        return res.render('lesson-order-detail', {orderDetail: orderDetail, wpParams: wpParams, wechatConfig: wechatConfigForFrontPage, shareMessage: shareMessage});
      }
      
      return res.render('lesson-order-detail-group', {orderDetail: orderDetail, wpParams: wpParams, joined: true, isFull: isFull, isOwner: isOwner, joinedUsers: joinedUsers, wechatConfig: wechatConfigForFrontPage, shareMessage: shareMessage});
    }else{
      if(!lessonOrder.isGroup){
        return res.render('lesson-order-detail', {orderDetail: orderDetail, wechatConfig: wechatConfigForFrontPage, shareMessage: shareMessage});
      }
      
      return res.render('lesson-order-detail-group', {orderDetail: orderDetail, joined: true, isFull: isFull, isOwner: isOwner, joinedUsers: joinedUsers, wechatConfig: wechatConfigForFrontPage, shareMessage: shareMessage});
    }
  }).catch(function(err){
    err.status = 500;
    console.log(err.message);
    return next(err);
  });
};

exports.updateLessonOrder = function(req, res, next){
  var orderDetail = req.body;
  var userId = req.session.user._id;
  
  co(function *(){
    try{
      var order = yield Order.findOne({
        _id: orderDetail.orderId
      }).exec();
      
      if(!order){
        throw new Error('Order Not Found');
      }
      
      var lessonOrder = yield LessonOrder.findOne({
        _id: order.realOrderId
      }).exec();  
    }catch(e){
      throw e;
    }
    
    if(userId.toString() !== order.userId.toString() || userId.toString() !== lessonOrder.ownerId.toString() || lessonOrder.state > ORDERSTATE.WAITTING_TO_PAY){
      var forbidden = new Error('Forbidden');
      forbidden.status = 403;
      throw forbidden;
    }
    
    lessonOrder.numberOfPeople = orderDetail.numberOfPeople;
    lessonOrder.name = orderDetail.name;
    lessonOrder.phoneNumber = orderDetail.phoneNumber;
    lessonOrder.message = orderDetail.message;
    lessonOrder.payType  = orderDetail.payType;
    lessonOrder.total = lessonOrder.fees * orderDetail.numberOfPeople;
    lessonOrder.state = ORDERSTATE.WAITTING_TO_COMFIRM;
    
    order.total = order.fees * orderDetail.numberOfPeople;
    order.numberOfPeople = orderDetail.numberOfPeople;
    order.stateLogs.push({
      state: ORDERSTATE.WAITTING_TO_COMFIRM,
      description: 'UserUpdate',
      updateDate: new Date()
    });
    
    try{
      var savedLessonOrder = yield lessonOrder.save();
      var savedOrder = yield order.save();
      
      return res.json({result:true});
    }catch(e){
      throw e;
    }

  }).catch(function(err){
    console.log(err.message);
    return res.json({result:false, error: err.message});
  })
};

exports.joinGroupLessonOrder = function(req, res, next){
  var orderDetail = req.body;
  var userId = req.session.user._id;
  
  co(function *(){
    try{
      var order = yield Order.findOne({
        _id: orderDetail.orderId
      }).exec();
      
      if(!order){
        throw new Error('订单错误');
      }
      
      var lessonOrder = yield LessonOrder.findOne({
        _id: order.realOrderId
      }).exec();
      
      var subOrder = yield Order.findOne({
        realOrderId: lessonOrder._id,
        userId: userId
      }).exec();
      
      var orderCounts = yield Order.count({
        realOrderId: lessonOrder._id
      });
    }catch(e){
      throw e;
    }
  
    if(subOrder){
      throw new Error('您已参加此团');
    }
    
    if(orderCounts === lessonOrder.numberOfPeople){
      throw new Error('人数已满');
    }
    
    if(lessonOrder.state !== ORDERSTATE.READY_TO_JOIN || userId.toString() === lessonOrder.ownerId.toString()){
      throw new Error('您不可参团');
    }
    
    if(moment(lessonOrder.bookingDate) <= moment()){
      throw new Error('订单已失效');
    }
    
    var orderState = lessonOrder.payType === 0 ? ORDERSTATE.READY_TO_JOIN : ORDERSTATE.WAITTING_TO_PAY;
    
    var newOrder = new Order({
        realOrderId: lessonOrder._id,
        orderType: ORDERTYPE.LESSON,
        userId: userId,
        ownerId: lessonOrder.ownerId,
        title: order.title,
        numberOfPeople: order.numberOfPeople,
        fees: order.fees,
        total: order.total,
        promotion: order.promotion,
        state: orderState,
        stateLogs:[{
          state: orderState,
          description: 'Join',
          updateDate: new Date()
        }],
        thumbnail: order.thumbnail,
        photos: order.photos
      });
    
    try{
      var savedOrder = yield newOrder.save();
      
      lessonOrder.joinedNumPeople = lessonOrder.joinedNumPeople + 1;
      
      if(lessonOrder.payType === 0){
        lessonOrder.paidNumOfPeople = lessonOrder.paidNumOfPeople + 1;
      }
      
      if(lessonOrder.payType === 0 && lessonOrder.joinedNumPeople === lessonOrder.numberOfPeople){
        lessonOrder.state = ORDERSTATE.COMPLETE;
        
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
      }
            
      var savedLessonOrder = yield lessonOrder.save();
      
      return res.json({result:true});
    }catch(e){
      throw e;
    }

  }).catch(function(err){
    return res.json({result:false, error: err.message});
  })
};

exports.setLessonOrderIsGroup = function(req, res, next){
  var orderId = req.params.id;
  var userId = req.session.user._id;

  co(function * () {
    try {
      var order = yield Order.findOne({
        _id: orderId,
        userId: userId
      }).exec();
      
      if(!order){
        throw new Error('Not Found');
      }

      var lessonOrder = yield LessonOrder.findOne({
        _id: order.realOrderId
      }).exec();
      
      lessonOrder.isGroup = true;
      
      lessonOrder.save();
      
      return res.json({result: true});
    } catch (e) {
      throw e;
    }
  }).catch(function(err){
    return res.json({result: false, error: err.message});
  });
};

exports.getLastLessonOrderContact = function(req, res, next) {
  var userId = req.session.user._id;
  LessonOrder.findOne({
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
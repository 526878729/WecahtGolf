/**
 * Created by Leo on 2016/3/16.
 */
var moment = require('moment');
var wechatCore = require('wechat-core');
var sms = require('../lib/sms');
var wechatTemplate = require('../lib/wechat-template');
var smsTemplate = require('../lib/sms-template');

exports.commitCourseOrderSuccess = function (order, callback) {
  var userWechatOpenId = order.openId;
  var orderId = order.courseOrderId;//order referenceId
  var order_id = order.order_id;
  var phoneNumber = order.phoneNumber;
  var time = moment().format('YYYY-MM-DD');
  var newCourseOrderTemplate = wechatTemplate.courseTemplate.getCourseOrderComitTemplate(userWechatOpenId, orderId, order_id, time);
  var smsMsg = smsTemplate.smsCourseTemplate.getCourseOrderComitTemplate(orderId);
  if (userWechatOpenId) {
    wechatCore.sendMessage(newCourseOrderTemplate, callback);
  } else {
    console.log('not found openid');
  }
  if (phoneNumber) {
    sms.sendSMS(phoneNumber, smsMsg, callback);
  } else {
    console.log('not found phone number');
  }
};

exports.commitDrivingRangeOrderSuccess = function (order, callback) {
  var userWechatOpenId = order.openId;
  var orderId = order.drivingRangeOrderId;
  var order_id = order.order_id;
  var phoneNumber = order.phoneNumber;
  var time = moment().format('YYYY-MM-DD');
  var newDrivingRangeOrderTemplate = wechatTemplate.drivingrangeTemplate.getDrivingRangeOrderComitTemplate(userWechatOpenId, orderId, order_id, time);
  var smsMsg = smsTemplate.smsDrivingRangeTemplate.getDrivingRangeOrderComitTemplate(orderId);
  if (userWechatOpenId) {
    wechatCore.sendMessage(newDrivingRangeOrderTemplate, callback);
  } else {
    console.log('not found openid');
  }
  if (phoneNumber) {
    sms.sendSMS(phoneNumber, smsMsg, callback);
  } else {
    console.log('not found phone number');
  }
};

exports.commitLessonOrderSuccess = function (order, callback) {
  var userWechatOpenId = order.openId;
  var orderId = order.lessonOrderId;
  var order_id = order.order_id;
  var phoneNumber = order.phoneNumber;
  var time = moment().format('YYYY-MM-DD');
  var newLessonOrderTemplate = wechatTemplate.lessonTemplate.getLessonOrderComitTemplate(userWechatOpenId, orderId, order_id, time);
  var smsMsg = smsTemplate.smsLessonTemplate.getLessonOrderComitTemplate(orderId);
  if (userWechatOpenId) {
    wechatCore.sendMessage(newLessonOrderTemplate, callback);
  } else {
    console.log('not found openid');
  }
  if (phoneNumber) {
    sms.sendSMS(phoneNumber, smsMsg, callback);
  } else {
    console.log('not found phone number');
  }
};

exports.confirmedCourseOrderSuccess = function (order, callback) {
  var userWechatOpenId = order.ownerId.wechatOpenId;
  var orderId = order.referenceId;
  var order_id = order.order_id;
  var phoneNumber = order.phoneNumber;
  var time = moment().format('YYYY-MM-DD');
  var newCourseOrderTemplate = wechatTemplate.courseTemplate.getCourseOrderConfirmedTemplate(userWechatOpenId, orderId, order_id, time);
  var smsMsg = smsTemplate.smsCourseTemplate.getCourseOrderConfirmedTemplate(orderId);
  if (userWechatOpenId) {
    wechatCore.sendMessage(newCourseOrderTemplate, callback);
  } else {
    console.log('not found openid');
  }
  if (phoneNumber) {
    sms.sendSMS(phoneNumber, smsMsg, callback);
  } else {
    console.log('not found phone number');
  }
};

exports.confirmedDrivingRangeOrderSuccess = function (order, callback) {
  var userWechatOpenId = order.ownerId.wechatOpenId;
  var orderId = order.referenceId;
  var order_id = order.order_id;
  var phoneNumber = order.phoneNumber;
  var time = moment().format('YYYY-MM-DD');
  var newDrivingRangeOrderTemplate = wechatTemplate.drivingrangeTemplate.getDrivingRangeOrderConfirmedTemplate(userWechatOpenId, orderId, order_id, time);
  var smsMsg = smsTemplate.smsDrivingRangeTemplate.getDrivingRangeOrderConfirmedTemplate(orderId);
  if (userWechatOpenId) {
    wechatCore.sendMessage(newDrivingRangeOrderTemplate, callback);
  } else {
    console.log('not found openid');
  }
  if (phoneNumber) {
    sms.sendSMS(phoneNumber, smsMsg, callback);
  } else {
    console.log('not found phone number');
  }
};

exports.confirmedLessonOrderSuccess = function (order, callback) {
  var userWechatOpenId = order.ownerId.wechatOpenId;
  var orderId = order.referenceId;
  var order_id = order.order_id;
  var phoneNumber = order.phoneNumber;
  var time = moment().format('YYYY-MM-DD');
  var newLessonOrderTemplate = wechatTemplate.lessonTemplate.getLessonOrderConfirmedTemplate(userWechatOpenId, orderId, order_id, time);
  var smsMsg = smsTemplate.smsLessonTemplate.getLessonOrderConfirmedTemplate(orderId);
  if (userWechatOpenId) {
    wechatCore.sendMessage(newLessonOrderTemplate, callback);
  } else {
    console.log('not found openid');
  }
  if (phoneNumber) {
    sms.sendSMS(phoneNumber, smsMsg, callback);
  } else {
    console.log('not found phone number');
  }
};

exports.paidCourseOrderSuccess = function (order, callback) {
  var userWechatOpenId = order.openId;
  var orderId = order.courseOrderId;
  var order_id = order.order_id;
  var phoneNumber = order.phoneNumber;
  var time = moment().format('YYYY-MM-DD');
  var newCourseOrderTemplate = wechatTemplate.courseTemplate.getCourseOrderPaidTemplate(userWechatOpenId, orderId, order_id, time);
  var smsMsg = smsTemplate.smsCourseTemplate.getCourseOrderPaidTemplate(orderId);
  if (userWechatOpenId) {
    wechatCore.sendMessage(newCourseOrderTemplate, callback);
  } else {
    console.log('not found openid');
  }
  if (phoneNumber) {
    sms.sendSMS(phoneNumber, smsMsg, callback);
  } else {
    console.log('not found phone number');
  }
};

exports.paidDrivingRangeOrderSuccess = function (order, callback) {
  var userWechatOpenId = order.openId;
  var orderId = order.drivingRangeOrderId;
  var order_id = order.order_id;
  var phoneNumber = order.phoneNumber;
  var time = moment().format('YYYY-MM-DD');
  var newDrivingRangeOrderTemplate = wechatTemplate.drivingrangeTemplate.getDrivingRangeOrderPaidTemplate(userWechatOpenId, orderId, order_id, time);
  var smsMsg = smsTemplate.smsDrivingRangeTemplate.getDrivingRangeOrderPaidTemplate(orderId);
  if (userWechatOpenId) {
    wechatCore.sendMessage(newDrivingRangeOrderTemplate, callback);
  } else {
    console.log('not found openid');
  }
  if (phoneNumber) {
    sms.sendSMS(phoneNumber, smsMsg, callback);
  } else {
    console.log('not found phone number');
  }
};

exports.paidLessonOrderSuccess = function (order, callback) {
  var userWechatOpenId = order.openId;
  var orderId = order.lessonOrderId;
  var order_id = order.order_id;
  var phoneNumber = order.phoneNumber;
  var time = moment().format('YYYY-MM-DD');
  var newLessonOrderTemplate = wechatTemplate.lessonTemplate.getLessonOrderPaidTemplate(userWechatOpenId, orderId, order_id, time);
  var smsMsg = smsTemplate.smsLessonTemplate.getLessonOrderPaidTemplate(orderId);
  if (userWechatOpenId) {
    wechatCore.sendMessage(newLessonOrderTemplate, callback);
  } else {
    console.log('not found openid');
  }
  if (phoneNumber) {
    sms.sendSMS(phoneNumber, smsMsg, callback);
  } else {
    console.log('not found phone number');
  }
};

exports.cancelCourseOrderSuccess = function (order, callback) {
  var userWechatOpenId = order.openId;
  var orderId = order.courseOrderId;
  var order_id = order.order_id;
  var phoneNumber = order.phoneNumber;
  var time = moment().format('YYYY-MM-DD');
  var cancelCourseOrderTemplate = wechatTemplate.courseTemplate.getCourseOrderCancelTemplate(userWechatOpenId, orderId, order_id, time);
  var smsMsg = smsTemplate.smsCourseTemplate.getCourseOrderCancelTemplate(orderId);
  if (userWechatOpenId) {
    wechatCore.sendMessage(cancelCourseOrderTemplate, callback);
  } else {
    console.log('not found openid');
  }
  if (phoneNumber) {
    sms.sendSMS(phoneNumber, smsMsg, callback);
  } else {
    console.log('not found phone number');
  }
};

exports.cancelDrivingRangeOrderSuccess = function (order, callback) {
  var userWechatOpenId = order.openId;
  var orderId = order.drivingRangeOrderId;
  var order_id = order.order_id;
  var phoneNumber = order.phoneNumber;
  var time = moment().format('YYYY-MM-DD');
  var cancelDrivingRangeOrderTemplate = wechatTemplate.drivingrangeTemplate.getDrivingRangeOrderCancelTemplate(userWechatOpenId, orderId, order_id, time);
  var smsMsg = smsTemplate.smsDrivingRangeTemplate.getDrivingRangeOrderCancelTemplate(orderId);
  if (userWechatOpenId) {
    wechatCore.sendMessage(cancelDrivingRangeOrderTemplate, callback);
  } else {
    console.log('not found openid');
  }
  if (phoneNumber) {
    sms.sendSMS(phoneNumber, smsMsg, callback);
  } else {
    console.log('not found phone number');
  }
};

exports.cancelLessonOrderSuccess = function (order, callback) {
  var userWechatOpenId = order.openId;
  var orderId = order.lessonOrderId;
  var order_id = order.order_id;
  var phoneNumber = order.phoneNumber;
  var time = moment().format('YYYY-MM-DD');
  var cancelLessonOrderTemplate = wechatTemplate.lessonTemplate.getLessonOrderCancelTemplate(userWechatOpenId, orderId, order_id, time);
  var smsMsg = smsTemplate.smsLessonTemplate.getLessonOrderCancelTemplate(orderId);
  if (userWechatOpenId) {
    wechatCore.sendMessage(cancelLessonOrderTemplate, callback);
  } else {
    console.log('not found openid');
  }
  if (phoneNumber) {
    sms.sendSMS(phoneNumber, smsMsg, callback);
  } else {
    console.log('not found phone number');
  }
};

exports.settingMasterSuccess = function (master, callback) {
  var masterWechatOpenId = master.wechatOpenId;
  var nickname = master.nickname;
  var masterPhoneNumber = master.phoneNumber;
  var time = moment().format('YYYY-MM-DD');
  var masterWechatTemplate = wechatTemplate.masterTemplate.getMasterSettingTemplate(masterWechatOpenId, nickname, time);
  var masterSmsTemplate = smsTemplate.smsMasterTemplate.getMasterSettingTemplate(nickname);
  if (masterWechatOpenId) {
    wechatCore.sendMessage(masterWechatTemplate, callback);
  } else {
    console.log('not found openid');
  }
  if (masterPhoneNumber) {
    sms.sendSMS(masterPhoneNumber, masterSmsTemplate, callback);
  } else {
    console.log('not found phone number');
  }
};

exports.recommendUserPaidSuccess = function (order, callback) {
  var masterWechatOpenId = order.wechatOpenId;
  var orderId = order.orderId;
  var nickname = order.nickname;
  var masterPhoneNumber = order.phoneNumber;
  var time = moment().format('YYYY-MM-DD');
  var masterWechatTemplate = wechatTemplate.masterTemplate.getMasterRecommendOrderTemaplte(masterWechatOpenId, orderId, time);
  var masterSmsTemplate = smsTemplate.smsMasterTemplate.getRecommendUserPaidTemplate(nickname);
  if (masterWechatOpenId) {
    wechatCore.sendMessage(masterWechatTemplate, callback);
  } else {
    console.log('not found openid!');
  }
  if (masterPhoneNumber) {
    sms.sendSMS(masterPhoneNumber, masterSmsTemplate, callback);
  } else {
    console.log('not found phone number!');
  }
};

exports.userFollowByMasterSuccess = function (result, callback) {
  var masterWechatOpenId = result.openId;
  var userNickname = result.userNickname;
  var masterNickname = result.masterNickname;
  var masterPhoneNumber = result.phoneNumber;
  var masterWechatTemplate = wechatTemplate.masterTemplate.getUserFollowByMasterTemplate(masterWechatOpenId, userNickname);
  var masterSmsTemplate = smsTemplate.smsMasterTemplate.getUserFollowByMasterTemplate(masterNickname, userNickname);
  if (masterWechatOpenId) {
    wechatCore.sendMessage(masterWechatTemplate, callback);
  } else {
    console.log('not found openid!');
  }
  if (masterPhoneNumber) {
    sms.sendSMS(masterPhoneNumber, masterSmsTemplate, callback);
  } else {
    console.log('not found phone number!');
  }
};
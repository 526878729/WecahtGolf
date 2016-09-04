/**
 * Created by Leo on 2016/3/14.
 */
var smsCourseTemplate = {
  getCourseOrderComitTemplate: function (orderId) {
    var template = "您的球场订单已提交成功！" +
      "订单编号：" + orderId + "。" +
      "您的球场订单已经提交，我们会在60分钟内为您确认场地席位。请您留意。客服电话：0755-888888888";
    return template;
  },
  getCourseOrderConfirmedTemplate: function (orderId) {
    var template = "您的球场订单已确认席位！" +
      "订单编号：" + orderId + "。" +
      "您的球场订单已经确认席位，请您在2小时内前往公众号完成支付，以免订单失效。客服电话：0755-888888888";
    return template;
  },
  getCourseOrderCancelTemplate: function (orderId) {
    var template = "您的球场订单已取消！" +
      "订单编号：" + orderId + "。" +
      "您的球场订单已经取消了。欢迎您对我们服务做详细咨询和提意见建议！客服电话：0755-888888888";
    return template;
  },
  getCourseOrderPaidTemplate: function (orderId) {
    var template = "您的球场订单已成功支付！" +
      "订单编号：" + orderId + "。" +
      "您的球场订单已经支付成功，请您到公众号订单详情查看球场地址与打球时间。祝您打球愉快！客服电话：0755-888888888";
    return template;
  }
};

var smsDrivingRangeTemplate = {
  getDrivingRangeOrderComitTemplate: function (orderId) {
    var template = "您的练习场订单已提交成功！" +
      "订单编号：" + orderId + "。" +
      "您的练习场订单已经提交，我们会在60分钟内为您确认场地席位。请您留意。客服电话：0755-888888888";
    return template;
  },
  getDrivingRangeOrderConfirmedTemplate: function (orderId) {
    var template = "您的练习场订单已确认席位！" +
      "订单编号：" + orderId + "。" +
      "您的练习场订单已经确认席位，请您在2小时内前往公众号完成支付，以免订单失效。客服电话：0755-888888888";
    return template;
  },
  getDrivingRangeOrderCancelTemplate: function (orderId) {
    var template = "您的练习场订单已取消！" +
      "订单编号：" + orderId + "。" +
      "您的练习场订单已经取消了。欢迎您对我们服务做详细咨询和提意见建议！客服电话：0755-888888888";
    return template;
  },
  getDrivingRangeOrderPaidTemplate: function (orderId) {
    var template = "您的练习场订单已成功支付！" +
      "订单编号：" + orderId + "。" +
      "您的练习场订单已经支付成功，请您到公众号订单详情查看练习场地址与练习时间。祝您打球愉快！客服电话：0755-888888888";
    return template;
  }
};

var smsLessonTemplate = {
  getLessonOrderComitTemplate: function (orderId) {
    var template = "您的课程订单已提交成功！" +
      "订单编号：" + orderId + "。" +
      "您的课程订单已经提交，我们会在60分钟内为您确认。请您留意。客服电话：0755-888888888";
    return template;
  },
  getLessonOrderCancelTemplate: function (orderId) {
    var template = "您的课程订单已取消！" +
      "订单编号：" + orderId + "。" +
      "您的课程订单已经取消了。欢迎您对我们服务做详细咨询和提意见建议！客服电话：0755-888888888";
    return template;
  },
  getLessonOrderPaidTemplate: function (orderId) {
    var template = "您的课程订单已成功支付！" +
      "订单编号：" + orderId + "。" +
      "您的课程订单已经支付成功，客服人员会在1个工作日内与您电话联系，为您安排专属课程表，请您留意。祝您学习愉快！客服电话：0755-888888888";
    return template;
  },
  getLessonOrderConfirmedTemplate: function (orderId) {
    var template = "您的课程订单已确认！" +
      "订单编号：" + orderId + "。" +
      "您的课程订单已经确认，请您在2小时内前往公众号完成支付，以免订单失效。客服电话：0755-888888888";
    return template;
  }
};

var smsMasterTemplate = {
  getMasterSettingTemplate: function (nickname) {
    var template = "尊敬的" + nickname + "，恭喜您成为推荐达人！欢迎您加入高手高尔夫！相关推广计划，欢迎拨打客服电话0755-888888888！";
    return template;
  },
  getRecommendUserPaidTemplate: function (nickname) {
    var template = "尊敬的推荐达人" + nickname + "，您推荐的好友已成功完成订单的支付，您将能得到一定的达人佣金！客服电话0755-888888888！";
    return template;
  },
  getUserFollowByMasterTemplate: function (masterName, userName) {
    var template = "尊敬的推荐达人" + masterName + "，您邀请的微信好友" + userName + "已成功关注高手高尔夫公众号！";
    return template;
  }
};

exports.smsCourseTemplate = smsCourseTemplate;
exports.smsDrivingRangeTemplate = smsDrivingRangeTemplate;
exports.smsLessonTemplate = smsLessonTemplate;
exports.smsMasterTemplate = smsMasterTemplate;

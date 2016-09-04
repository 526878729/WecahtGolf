/**
 * Created by Leo on 2016/3/11.
 */
//var order_state_notice_id = 'QfhsXwizKzDK4pUTwikgPh_ePLyWZhgJoq2JlMWiEMY'; //所有订单状态通用的微信模板ID
var order_state_notice_id = '1C1AXjEyFZO7Wfb2_-5FhzYEtqhZpRP--Y0gP9L04wI'; //所有订单状态通用的微信模板ID
//var master_notice_id = 'jt94_61PYC6pJ8on743JxILjeudKbSGHJHuElzqlOzI'; //用户成为推荐达人时的通知模板
var master_notice_id = '	QWnkJms7UcFyAfupRV8qDXYBBW9UHoKXo07TY06-JNA'; //用户成为推荐达人时的通知模板
var master_newuser_notice_id = "X8CnGuzCF0ZliqQUKErCyFbOHAn77dP3ECwjW07cXKA";//用户关注通知达人模板
var course_order_detail_url = "http://sugars.vicp.cc/order/detail/course/";
var drivingrange_order_detail_url = "http://sugars.vicp.cc/order/detail/drivingrange/";
var lesson_order_detail_url = "http://sugars.vicp.cc/order/detail/lesson/";
var master_code_image_url = "http://sugars.vicp.cc/user/referee/poster";


var courseTemplate = {
  //获取球场预定生成订单的通知模板
  getCourseOrderComitTemplate: function (wechatOpenId, orderId, orderiObjId, creationDate) {
    var template = {
      "touser": wechatOpenId,
      "template_id": order_state_notice_id,
      "url": course_order_detail_url + orderiObjId,
      "data": {
        "first": {
          "value": "您的球场订单已提交成功\n",
          "color": "#173177"
        },
        "keyword1": {
          "value": orderId,
          "color": "#173177"
        },
        "keyword2": {
          "value": "订单已提交，等待球场确认",
          "color": "#173177"
        },
        "keyword3": {
          "value": creationDate + "\n",
          "color": "#173177"
        },
        "remark": {
          "value": "您预订的球场订单已经提交，我们会在60分钟内为您确认场地席位。请您注意查收微信与短信通知。" +
          "客服电话：88888888",
          "color": "#173177"
        }
      }
    };
    return template;
  },
  //获取管理员确认球场订单的通知模板
  getCourseOrderConfirmedTemplate: function (wechatOpenId, orderId, orderiObjId, creationDate) {
    var template = {
      "touser": wechatOpenId,
      "template_id": order_state_notice_id,
      "url": course_order_detail_url + orderiObjId,
      "data": {
        "first": {
          "value": "您的球场订单已确认席位\n",
          "color": "#173177"
        },
        "keyword1": {
          "value": orderId,
          "color": "#173177"
        },
        "keyword2": {
          "value": "订单已确认，等待付款",
          "color": "#173177"
        },
        "keyword3": {
          "value": creationDate + "\n",
          "color": "#173177"
        },
        "remark": {
          "value": "您预订的球场订单已经确认席位，请您在2小时内完成支付，以免订单失效。" +
          "客服电话：88888888",
          "color": "#173177"
        }
      }
    };
    return template;
  },
  //获取球场付款成功后的通知模板
  getCourseOrderPaidTemplate: function (wechatOpenId, orderId, orderiObjId, creationDate) {
    var template = {
      "touser": wechatOpenId,
      "template_id": order_state_notice_id,
      "url": course_order_detail_url + orderiObjId,
      "data": {
        "first": {
          "value": "您的球场订单已成功支付\n",
          "color": "#173177"
        },
        "keyword1": {
          "value": orderId,
          "color": "#173177"
        },
        "keyword2": {
          "value": "订单已支付",
          "color": "#173177"
        },
        "keyword3": {
          "value": creationDate + "\n",
          "color": "#173177"
        },
        "remark": {
          "value": "您预订的球场订单已经支付成功，请您点击详情查看球场地址与打球时间。祝您打球愉快！" +
          "客服电话：88888888",
          "color": "#173177"
        }
      }
    };
    return template;
  },
  //获取球场订单取消的通知模板
  getCourseOrderCancelTemplate: function (wechatOpenId, orderId, orderiObjId,creationDate) {
    var template = {
      "touser": wechatOpenId,
      "template_id": order_state_notice_id,
      "url": course_order_detail_url + orderiObjId,
      "data": {
        "first": {
          "value": "您的球场订单已取消\n",
          "color": "#173177"
        },
        "keyword1": {
          "value": orderId,
          "color": "#173177"
        },
        "keyword2": {
          "value": "订单已取消",
          "color": "#173177"
        },
        "keyword3": {
          "value": creationDate + "\n",
          "color": "#173177"
        },
        "remark": {
          "value": "您预订的球场订单已经取消。欢迎您对我们服务做详细咨询和提意见建议！" +
          "客服电话：88888888",
          "color": "#173177"
        }
      }
    };
    return template;
  }
};

var drivingrangeTemplate = {
  //获取练习场预定生成订单的通知模板
  getDrivingRangeOrderComitTemplate: function (wechatOpenId, orderId, orderiObjId, creationDate) {
    var template = {
      "touser": wechatOpenId,
      "template_id": order_state_notice_id,
      "url": drivingrange_order_detail_url + orderiObjId,
      "data": {
        "first": {
          "value": "您的练习场订单已提交成功\n",
          "color": "#173177"
        },
        "keyword1": {
          "value": orderId,
          "color": "#173177"
        },
        "keyword2": {
          "value": "订单已提交，等待练习场确认",
          "color": "#173177"
        },
        "keyword3": {
          "value": creationDate + "\n",
          "color": "#173177"
        },
        "remark": {
          "value": "您预订的练习场订单已经提交，我们会在60分钟内为您确认场地席位。请您注意查收微信与短信通知。" +
          "客服电话：88888888",
          "color": "#173177"
        }
      }
    };
    return template;
  },
  //获取管理员确认练习场订单的通知模板
  getDrivingRangeOrderConfirmedTemplate: function (wechatOpenId, orderId, orderiObjId, creationDate) {
    var template = {
      "touser": wechatOpenId,
      "template_id": order_state_notice_id,
      "url": drivingrange_order_detail_url + orderiObjId,
      "data": {
        "first": {
          "value": "您的练习场订单已确认席位\n",
          "color": "#173177"
        },
        "keyword1": {
          "value": orderId,
          "color": "#173177"
        },
        "keyword2": {
          "value": "订单已确认，等待付款",
          "color": "#173177"
        },
        "keyword3": {
          "value": creationDate + "\n",
          "color": "#173177"
        },
        "remark": {
          "value": "您预订的练习场订单已经确认席位，请您在2小时内完成支付，以免订单失效。" +
          "客服电话：88888888",
          "color": "#173177"
        }
      }
    };
    return template;
  },
  //获取练习场付款成功后的通知模板
  getDrivingRangeOrderPaidTemplate: function (wechatOpenId, orderId, orderiObjId, creationDate) {
    var template = {
      "touser": wechatOpenId,
      "template_id": order_state_notice_id,
      "url": drivingrange_order_detail_url + orderiObjId,
      "data": {
        "first": {
          "value": "您的练习场订单已成功支付\n",
          "color": "#173177"
        },
        "keyword1": {
          "value": orderId,
          "color": "#173177"
        },
        "keyword2": {
          "value": "订单已支付",
          "color": "#173177"
        },
        "keyword3": {
          "value": creationDate + "\n",
          "color": "#173177"
        },
        "remark": {
          "value": "您预订的练习场订单已经支付成功，请您点击详情查看练习场地址与打球时间。祝您打球愉快！" +
          "客服电话：88888888",
          "color": "#173177"
        }
      }
    };
    return template;
  },
  //获取练习场订单取消的通知模板
  getDrivingRangeOrderCancelTemplate: function (wechatOpenId, orderId, orderiObjId, creationDate) {
    var template = {
      "touser": wechatOpenId,
      "template_id": order_state_notice_id,
      "url": drivingrange_order_detail_url + orderiObjId,
      "data": {
        "first": {
          "value": "您的练习场订单已取消\n",
          "color": "#173177"
        },
        "keyword1": {
          "value": orderId,
          "color": "#173177"
        },
        "keyword2": {
          "value": "订单已取消",
          "color": "#173177"
        },
        "keyword3": {
          "value": creationDate + "\n",
          "color": "#173177"
        },
        "remark": {
          "value": "您预订的练习场订单已经取消。欢迎您对我们服务做详细咨询和提意见建议！" +
          "客服电话：88888888",
          "color": "#173177"
        }
      }
    };
    return template;
  }
};

var lessonTemplate = {
  getLessonOrderComitTemplate: function (wechatOpenId, orderId, orderiObjId, creationDate) {
    var template = {
      "touser": wechatOpenId,
      "template_id": order_state_notice_id,
      "url": lesson_order_detail_url + orderiObjId,
      "data": {
        "first": {
          "value": "您的课程订单已提交成功\n",
          "color": "#173177"
        },
        "keyword1": {
          "value": orderId,
          "color": "#173177"
        },
        "keyword2": {
          "value": "订单已提交，等待支付",
          "color": "#173177"
        },
        "keyword3": {
          "value": creationDate + "\n",
          "color": "#173177"
        },
        "remark": {
          "value": "您预订的课程订单已经提交，我们会在60分钟内为您确认。请您注意查收微信与短信通知。" +
          "客服电话：88888888",
          "color": "#173177"
        }
      }
    };
    return template;
  },
  getLessonOrderPaidTemplate: function (wechatOpenId, orderId, orderiObjId, creationDate) {
    var template = {
      "touser": wechatOpenId,
      "template_id": order_state_notice_id,
      "url": lesson_order_detail_url + orderiObjId,
      "data": {
        "first": {
          "value": "您的课程订单已成功支付\n",
          "color": "#173177"
        },
        "keyword1": {
          "value": orderId,
          "color": "#173177"
        },
        "keyword2": {
          "value": "订单已支付",
          "color": "#173177"
        },
        "keyword3": {
          "value": creationDate +"\n",
          "color": "#173177"
        },
        "remark": {
          "value": "您预订的课程订单已经支付成功，客服人员会在1个工作日内与您电话联系，为您安排专属课程表，请您留意。祝您学习愉快！" +
          "客服电话：88888888",
          "color": "#173177"
        }
      }
    };
    return template;
  },
  getLessonOrderCancelTemplate: function (wechatOpenId, orderId, orderiObjId, creationDate) {
    var template = {
      "touser": wechatOpenId,
      "template_id": order_state_notice_id,
      "url": lesson_order_detail_url + orderiObjId,
      "data": {
        "first": {
          "value": "您的课程订单已取消\n",
          "color": "#173177"
        },
        "keyword1": {
          "value": orderId,
          "color": "#173177"
        },
        "keyword2": {
          "value": "订单已取消",
          "color": "#173177"
        },
        "keyword3": {
          "value": creationDate + "\n",
          "color": "#173177"
        },
        "remark": {
          "value": "您预订的课程订单已经取消。欢迎您对我们服务做详细咨询和提意见建议！" +
          "客服电话：88888888",
          "color": "#173177"
        }
      }
    };
    return template;
  },
  getLessonOrderConfirmedTemplate: function (wechatOpenId, orderId, orderiObjId, creationDate) {
    var template = {
      "touser": wechatOpenId,
      "template_id": order_state_notice_id,
      "url": lesson_order_detail_url + orderiObjId,
      "data": {
        "first": {
          "value": "您的课程订单已确认\n",
          "color": "#173177"
        },
        "keyword1": {
          "value": orderId,
          "color": "#173177"
        },
        "keyword2": {
          "value": "订单已确认",
          "color": "#173177"
        },
        "keyword3": {
          "value": creationDate + "\n",
          "color": "#173177"
        },
        "remark": {
          "value": "您预订的课程订单已经确认，请您在2小时内完成支付，以免订单失效。" +
          "客服电话：88888888",
          "color": "#173177"
        }
      }
    };
    return template;
  }
};

var masterTemplate = {
  getMasterSettingTemplate: function (wechatOpenId, nickname, time) {
    var template = {
      "touser": wechatOpenId,
      "template_id": master_notice_id,
      "url": master_code_image_url,  //click template to redirect
      "data": {
        "first": {
          "value": "尊敬的用户，恭喜您成为推荐达人。\n",
          "color": "#173177"
        },
        "keyword1": {
          "value": nickname,
          "color": "#173177"
        },
        "keyword2": {
          "value": "推荐达人",
          "color": "#173177"
        },
        "keyword3": {
          "value": time + "\n",
          "color": "#173177"
        },
        "remark": {
          "value": "点击查看您的专属推广海报，" +
          "了解相关推广计划，欢迎拨打客服电话88888888！",
          "color": "#173177"
        }
      }
    };
    return template;
  },
  getMasterRecommendOrderTemaplte: function (wechatOpenId, orderId, time) {
    var template = {
      "touser": wechatOpenId,
      "template_id": order_state_notice_id,
      "data": {
        "first": {
          "value": "好友订单状态更新\n",
          "color": "#173177"
        },
        "keyword1": {
          "value": orderId,
          "color": "#173177"
        },
        "keyword2": {
          "value": "订单已付款",
          "color": "#173177"
        },
        "keyword3": {
          "value": time + "\n",
          "color": "#173177"
        },
        "remark": {
          "value": "尊敬的推荐达人，您推荐的好友已经完成订单付款。" +
          "客服电话：88888888",
          "color": "#173177"
        }
      }
    };
    return template;
  },
  getUserFollowByMasterTemplate: function (wechatOpenId, nickname) {
    var template = {
      "touser": wechatOpenId,
      "template_id": master_newuser_notice_id,
      "data": {
        "first": {
          "value": "尊敬的推广达人，辛苦了！\n",
          "color": "#173177"
        },
        "keyword1": {
          "value": nickname,
          "color": "#173177"
        },
        "keyword2": {
          "value": "邀请好友关注高手高尔夫\n",
          "color": "#173177"
        },
        "remark": {
          "value": "您的好友已关注！快去邀请他（她）来体验高尔夫入门课程吧！" +
          "客服电话：88888888",
          "color": "#173177"
        }
      }
    };
    return template;
  }
};

module.exports = {};
module.exports.courseTemplate = courseTemplate;
module.exports.drivingrangeTemplate = drivingrangeTemplate;
module.exports.lessonTemplate = lessonTemplate;
module.exports.masterTemplate = masterTemplate;

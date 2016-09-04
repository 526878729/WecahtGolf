/**
 * Created by qxj on 16/2/5.
 */

exports.ORDERSTATE = {
  WAITTING_TO_COMFIRM: 0,    //订单生成,等待客服后台确定
  WAITTING_TO_PAY: 1,       //确认完成,用户可以付款
  READY_TO_JOIN:2,          //正式开团
  COMPLETE: 3,             //人数达到,交易完成
  CANCEL: 4,               //针对 0 的状态,由于场地等问题而取消
  USERCANCEL:5            //团长手动取消
};

exports.ORDERTYPE = {
  COURSE_ORDER: 0,    //球场订单
  DRIVING_RANGE: 1,       //练习订单
  LESSON: 2           //课程订单
};

exports.PAYTYPE = {
  NONE: 0,         //未支付
  WEIXIN: 1,       //微信
  ALIPAY: 2,       //支付宝
  UNIONPAY: 3,     //银联
  CREDITCAR: 4,    //信用卡
  BANKTRANSFER: 5  //银行转账
};

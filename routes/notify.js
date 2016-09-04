/**
 * Created by qxj on 16/2/4.
 */
var express = require('express');
var router = express.Router();

var wechatPay = require('../controllers/wechat-pay');
var wechatNotify = require('../controllers/wechat-notify');

router.post('/wechat', wechatPay.notify);

router.get('/wechat/message', wechatNotify.checkServer);
router.post('/wechat/message', wechatNotify.handleNotifyFromWechat);

module.exports = router;
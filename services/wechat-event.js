/**
 * Created by qxj on 16/3/9.
 */
var co = require('co');
var User = require('../models/user');
var wechatCore = require('wechat-core');
var messageNotify = require('./message-notify');

var messages = {
  subscribe: 'hello，欢迎来到GOLF[愉快]\n点击【订场】：帮你预定好球场；\n点击【入门】：新手入门找教练；\n点击【我的】：订单查询不用等；',
  subscribe_from_master: '恭喜您！您已经获得GOLF提供的高尔夫入门课程，有效期为30天。课程由专业教练1对1指导，时长60分钟。上课地点在深圳南山区高尔夫练习场。您可以随时拨打客服电话8888888888预约上课时间。'
};

exports.subscribe = function (message, callback) {
  var refereeId = null;
  var fromMaster = false;

  if (message.eventkey) {
    var type = message.eventkey.split('_');
    if (type[1] == 'MASTER') {
      refereeId = type[2];
    }
  }

  var wechatOpenId = message.fromusername;

  co(function *() {
    try {
      var user = yield User.findOne({
        wechatOpenId: wechatOpenId
      }).exec();

      var userinfo = yield new Promise(function (resolve, reject) {
        wechatCore.getUserInfoByAppAccessToken(wechatOpenId, function (err, response, result) {
          if (err || !result) {
            reject();
          } else {
            result = JSON.parse(result);
            resolve(result);
          }
        })
      });
    } catch (e) {
      console.log('Find User Error');
      throw e;
    }

    if (!userinfo) {
      throw new Error('Get Userinfo from wechat fail');
    }

    if (!user) {
      user = new User({
        wechatOpenId: wechatOpenId
      });
    }

    var followedDate = new Date(parseInt(userinfo.subscribe_time) * 1000);
    followedDate = isNaN(followedDate.getTime()) ? null : followedDate;

    user.nickname = userinfo.nickname;
    user.sex = parseInt(userinfo.sex);
    user.country = userinfo.country;
    user.province = userinfo.province;
    user.city = userinfo.city;
    user.avatar = userinfo.headimgurl;
    user.followed = true;
    user.followedDate = followedDate;

    if (!user.refereeId && refereeId) {
      user.refereeId = refereeId;
      fromMaster = true;

      try {
        var master = yield User.findOne({_id: refereeId}).exec();
      } catch (err) {
        throw new Error('master not found!');
      }
      var result = {
        openId: master.wechatOpenId,
        userNickname: user.nickname,
        masterNickname: master.nickname,
        phoneNumber: master.phoneNumber
      };
      messageNotify.userFollowByMasterSuccess(result);
    }

    try {
      var savedUser = yield user.save();
    } catch (err) {
      throw new Error('Save user err: ' + err.message);
    }

    if (savedUser) {
      if(fromMaster){
        return callback(messages.subscribe_from_master);
      }else{
        return callback(messages.subscribe);
      }
    }
    callback(null);
  }).catch(function (err) {
    console.log(err.message);
    callback(null);
  });
};

exports.unsubscribe = function (message, callback) {
  var wechatOpenId = message.fromusername;

  co(function *() {
    try {
      var user = yield User.findOne({
        wechatOpenId: wechatOpenId
      }).exec();

      if(!user){
        return callback(null);
      }

      user.followed = false;
      user.followedDate = new Date();
      user.refereeId = undefined;

      var savedUser = yield user.save();
      return callback(null);
    } catch(e){
      throw e;
    }
  }).catch(function (err) {
    console.log(err.message);
    return callback(null);
  });
};
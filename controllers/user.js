/**
 * Created by qxj on 15/12/23.
 */
var wechatCore = require('wechat-core');
var co = require('co');
var URI = require('urijs');
var User = require('../models/user');
var config = require('../config');

function setSessionAndCookie(req, res, user) {
  req.session.user = user;
  if (user.wechatOpenId) {
    req.session.wechat = user.wechatOpenId;
  }

  res.cookie('client_username', user.nickname, config.cookieOption);
  res.cookie('client_attributes', user.id, config.cookieOption);
}

exports.getUser = function(req, res, next){
  if(!req.session.user){
    var err = new Error("Forbidden");
    err.status = 403;
    return next(err);
  }

  return res.render('userinfo', { user: req.session.user });
};

exports.getreferee = function (req, res, next) {
  if (!req.session.user) {
    var err = new Error("Forbidden");
    err.status = 403;
    return next(err);
  }

  User.find({
    refereeId: req.session.user._id
  }).select('nickname avatar followedDate').sort({
    followedDate: -1
  }).exec(function (err, users){
    if(err){
      err.status = 500;
      return next(err);
    }

    return res.render('user-referee-list', {users: users});
  });
};

exports.getPoster = function (req, res, next) {
  if(!req.session.user){
    var err = new Error("Forbidden");
    err.status = 403;
    return next(err);
  }

  User.findOne({
    _id: req.session.user._id
  }, function(err, user){
    if(err){
      return next(err);
    }

    if(!user.isMaster){
      var notFound = new Error("Not Found");
      notFound.status = 404;
      return next(notFound);
    }

    return res.render('user-master-post', { userId: user.id });
  })
};

exports.autoLogin = function (req, res, next) {
  if (req.session.user) {
    return next();
  }

  var uid = req.signedCookies['client_attributes'];

  co(function * ()
  {
    if (uid) {
      try {
        var user = yield User.findOne({_id: uid}).select('nickname wechatOpenId avatar isMaster').exec();
      } catch (err) {
        throw new Error('Finding user by uid err: ' + err.message);
      }

      if (user) {
        setSessionAndCookie(req, res, user);
        return next();
      }
    }

    if (!req.isFromWechat) {
      //For testing, delete when release
      var testUser = yield User.findOne({_id: "5711eadd2ea2dace95a4e3ff"}).exec();
      if (testUser) {
        setSessionAndCookie(req, res, testUser);
      }
      return next();
    }

    var origin_url = encodeURI('http://' + req.hostname + req.originalUrl);

    if (!req.session.wechat && !req.query.state) {
      return res.redirect(wechatCore.getUrlForCodeScopeBase(origin_url, '1'));
    }

    if (!req.session.wechat && req.query.state === '1' && req.query.code) {
      try {
        var wechat = yield new Promise(function (resolve, reject) {
          wechatCore.getUserAccessToken(req.query.code, function (err, response, data) {
            if (!data || err) {
              reject();
            }

            var wechat = JSON.parse(data);
            resolve(wechat);
          });
        });

        if (wechat.errcode) {
          throw new Error('GetUserAccessToken err: ' + wechat.errcode);
        }

        req.session.wechat = wechat.openid;

        user = yield User.findOne({wechatOpenId: wechat.openid}).select('nickname wechatOpenId avatar isMaster').exec();

        if (!user) {
          origin_url = URI(origin_url).query('');
          return res.redirect(wechatCore.getUrlForCodeScopeUserInfo(origin_url.toString(), '2'));
        }

        setSessionAndCookie(req, res, user);
        return next();

      } catch (err) {
        throw new Error('GetUserAccessToken err: ' + err.message);
      }
    }

    if (req.query.state === '2' && req.query.code) {
      try {
        var data = yield new Promise(function (resolve, reject) {
          wechatCore.getUserAccessToken(req.query.code, function (err, response, result) {
            if (!result || err) {
              reject();
            } else {
              resolve(result);
            }
          })
        });

        data = JSON.parse(data);

        var checkResult = yield new Promise(function (resolve, reject) {
          wechatCore.checkUserAccessToken(data.access_token, data.openid, function (err, response, result) {
            if (err || !result) {
              reject();
            } else {
              resolve(result);
            }
          });
        });

        checkResult = JSON.parse(checkResult);

        if (checkResult.errcode !== 0) {
          var refreshResult = yield new Promise(function (resolve, reject) {
            wechatCore.refreshAccessToken(data.access_token, function (err, response, result) {
              if (err || !result) {
                reject();
              } else {
                resolve(result);
              }
            })
          });

          refreshResult = JSON.parse(refreshResult);

          data.access_token = refreshResult.access_token;
        }

        var userinfo = yield new Promise(function (resolve, reject) {
          wechatCore.getUserInfo(data.access_token, data.openid, function (err, response, result) {
            if (err || !result) {
              reject();
            } else {
              resolve(result);
            }
          })
        });
      } catch (e) {
        throw e;
      }

      userinfo = JSON.parse(userinfo);
      
      var followed = userinfo.subscribe === 1 ? true : false;
      var followedDate = new Date(parseInt(userinfo.subscribe_time));
      followedDate = isNaN(followedDate.getTime()) ? null : followedDate;

      var user = new User({
        wechatOpenId: userinfo.openid,
        nickname: userinfo.nickname,
        isMaster: userinfo.isMaster,
        sex: parseInt(userinfo.sex),
        country: userinfo.country,
        province: userinfo.province,
        city: userinfo.city,
        avatar: userinfo.headimgurl,
        followed: followed,
        followedDate: followedDate
      });

      try {
        var savedUser = yield user.save();
      } catch (err) {
        throw new Error('Save user err: ' + err.message);
      }

      setSessionAndCookie(req, res, savedUser);

      origin_url = URI(origin_url).query('');
      return res.redirect(origin_url.toString());
    }
  }
  ).
  catch(function (err) {
    console.log('-AutoLogin-' + err.message);
    return next();
  });
};

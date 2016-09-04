/**
 * Created by 2nd on 16/3/17.
 */
var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;
var gm = require('gm').subClass({imageMagick: true});
var co = require('co');
var wechatCore = require('wechat-core');
var download = require('../lib/file-download').download;
var User = require('../models/user');

var public_path = path.resolve(__dirname, '../public');
var avatars_path = public_path + '/master_files/avatars/';
var posters_path = public_path + '/master_files/posters/';
var qrcodes_path = public_path + '/master_files/qrcodes/';
var mask_path = public_path + '/img/avatar_mask.png';
var qrcode_cover_path = public_path + '/img/qrcode_cover.jpg';

exports.generatePoster = function(masterId){
  var qrcode_path_origin = qrcodes_path + masterId + '_origin.jpg';
  var qrcode_path_240 = qrcodes_path + masterId + '_240.jpg';
  var avatar_path_origin = avatars_path + masterId + '_origin.jpg';
  var avatar_path_round = avatars_path + masterId + '_round.png';
  var poster_path = posters_path + masterId + '.jpg';

  co(function *() {
    try {
      var master = yield User.findOne({
        _id: masterId
      }).exec();
    }catch (e){
      throw e;
    }

    if(!master || !master.wechatOpenId){
      throw new Error('Invalid Master');
    }

    try {
      if(!master.masterQRCode.ticket) {
        var qrcodeParams = {
          'action_name': 'QR_LIMIT_STR_SCENE',
          'action_info': {'scene':
          {
            'scene_str': 'MASTER_' + masterId
          }
          }
        };

        var masterQRCode = yield new Promise(function (resolve, reject) {
          wechatCore.getQRCodeTicket(qrcodeParams, function (err, res, body) {
            if (err || res.statusCode !== 200) {
              reject();
            }

            var data = JSON.parse(body);

            resolve({
              ticket: data.ticket,
              url: data.url
            });
          });
        });

        master.masterQRCode = masterQRCode;
        master = yield master.save();
      }

      var qrcodeUrl = wechatCore.getQRCodeImageUrl(master.masterQRCode.ticket);

      var qrcodeDownloaded = yield new Promise(function(resolve, reject){
        download(qrcodeUrl, qrcode_path_origin, function(err){
          if(!err){
            resolve(true);
          }

          reject(false);
        });
      });

      var qrcodeResized = yield new Promise(function(resolve, reject){
        gm(qrcode_path_origin).resize(240, 240).noProfile().write(qrcode_path_240, function (err) {
          if(!err){
            resolve(true);
          }

          reject(false);
        });
      });

      var avatarUrl = master.avatar.slice(0, master.avatar.length - 1);
      avatarUrl = avatarUrl + '132';

      var avatarDownloaded = yield new Promise(function(resolve, reject){
        download(avatarUrl, avatar_path_origin, function(err){
          if(!err){
            resolve(true);
          }

          reject(false);
        });
      });

      var avatarRounded = yield new Promise(function(resolve, reject){
        var gmComposite = 'convert ' + avatar_path_origin + ' -alpha set -gravity center -extent 132x132 ' + mask_path + ' -compose DstIn -composite ' + avatar_path_round;
        exec(gmComposite, function(err) {
          if(!err){
            resolve(true);
          }

          reject(false);
        });
      });

      var posterGenerated = yield new Promise(function(resolve, reject){
        var gmComposite = 'convert ' + qrcode_cover_path + ' ' + avatar_path_round + ' -geometry +249+34 -composite ' + qrcode_path_240 + ' -geometry +205+680 -composite ' + poster_path;
        exec(gmComposite, function(err) {
          if(!err){
            resolve(true);
          }

          reject(false);
        });
      });

      return posterGenerated;
    } catch (e){
      throw e;
    }
  }).catch(function(error){
    console.log(error);
    return false;
  });
};
/**
 * Created by Waley Wen on 16/01/12.
 */
var Admin = require('../models/admin');
var Course = require('../models/course');
var User = require('../models/user');
var Commission = require('../models/commission');
var DrivingRange = require('../models/driving-range');
var Lesson = require('../models/lesson');
var LessonPromotion = require('../models/lesson-promotion');
var ORDERSTATE = require('../lib/enums').ORDERSTATE;
var CourseOrder = require('../models/course-order');
var DrivingRangeOrder = require('../models/driving-range-order');
var LessonOrder = require('../models/lesson-order');
var Order = require('../models/order');
var co = require('co');
var fs = require('fs');
var path = require('path');
var wechatCore = require('wechat-core');
var messageNotify = require('../services/message-notify');
var sms = require('../lib/sms');
var gm = require('gm').subClass({imageMagick: true});
var masterPoster = require('../services/master-poster');

exports.showPanel = function (req, res, next) {
  return res.render('admin-control-panel');
};

exports.login = function (req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  Admin.findOne({'username': username, 'hashedPassword': password}, function (err, admin) {
    if (err) {
      err.status = 400;
      return next(err);
    } else {
      if (!admin) {
      } else {
        req.session.adminID = admin._id;
      }
      return res.redirect('/admin');
    }
  });
};

exports.logout = function (req, res, next) {
  req.session.adminID = null;
  return res.redirect('/admin');
};

exports.getAllCourses = function (req, res, next) {
  Course.find({}, function (err, courses) {
    if (err) {
      err.status = 400;
      return next(err);
    } else {
      var result = {};
      result.data = courses;
      result.code = 200;
      return res.json(result);
    }
  });
};

exports.createCourse = function (req, res, next) {
  var newCourseData = req.body;

  savePhotoForSpecifiedData(newCourseData, 'course');

  Course.create(newCourseData, function (err, course) {
    if (err) {
      console.log(err);
      err.status = 400;
      return next(err);
    } else {
      var result = {};
      result.data = course;
      result.code = 200;
      return res.json(result);
    }
  });
};

exports.modifyCourse = function (req, res, next) {
  var courseID = req.params.id;
  var updatedCourseData = req.body;
  delete updatedCourseData._id;

  savePhotoForSpecifiedData(updatedCourseData, 'course');

  Course.update({_id: courseID}, updatedCourseData, function (err, numberAffected, rawResponse) {
    if (err) {
      err.status = 400;
      return next(err);
    } else {
      Course.findOne({_id: courseID}, function (err, course) {
        if (err) {
          err.status = 400;
          return next(err);
        } else {
          var result = {};
          result.data = course;
          result.code = 200;
          return res.json(result);
        }
      });
    }
  });
};

exports.removeCourse = function (req, res, next) {
  var courseID = req.params.id;
  Course.remove({'_id': courseID}, function (err, product) {
    if (err) {
      err.status = 400;
      return next(err);
    } else {
      var result = {};
      result.data = courseID;
      result.code = 200;
      return res.json(result);
    }
  });
};

exports.getAllDrivingRanges = function (req, res, next) {
  DrivingRange.find({}, function (err, drivingRanges) {
    if (err) {
      err.status = 400;
      return next(err);
    } else {
      var result = {};
      result.data = drivingRanges;
      result.code = 200;
      return res.json(result);
    }
  });
};

exports.createDrivingRange = function (req, res, next) {
  var newDrivingRangeData = req.body;

  savePhotoForSpecifiedData(newDrivingRangeData, 'drivingRange');

  DrivingRange.create(newDrivingRangeData, function (err, drivingRange) {
    if (err) {
      console.log(err);
      err.status = 400;
      return next(err);
    } else {
      var result = {};
      result.data = drivingRange;
      result.code = 200;
      return res.json(result);
    }
  });
};

exports.modifyDrivingRange = function (req, res, next) {
  var drivingRangeID = req.params.id;
  var updatedDrivingRangeData = req.body;
  delete updatedDrivingRangeData._id;

  savePhotoForSpecifiedData(updatedDrivingRangeData, 'drivingRange');

  DrivingRange.update({_id: drivingRangeID}, updatedDrivingRangeData, function (err, numberAffected, rawResponse) {
    if (err) {
      err.status = 400;
      return next(err);
    } else {
      DrivingRange.findOne({_id: drivingRangeID}, function (err, drivingRange) {
        if (err) {
          err.status = 400;
          return next(err);
        } else {
          var result = {};
          result.data = drivingRange;
          result.code = 200;
          return res.json(result);
        }
      });
    }
  });
};

exports.removeDrivingRange = function (req, res, next) {
  var drivingRangeID = req.params.id;
  DrivingRange.remove({'_id': drivingRangeID}, function (err, product) {
    if (err) {
      err.status = 400;
      return next(err);
    } else {
      var result = {};
      result.data = drivingRangeID;
      result.code = 200;
      return res.json(result);
    }
  });
};

exports.getAllLessons = function (req, res, next) {
  Lesson.find({}, function (err, lessons) {
    if (err) {
      err.status = 400;
      return next(err);
    } else {
      var result = {};
      result.data = lessons;
      result.code = 200;
      return res.json(result);
    }
  });
};

exports.createLesson = function (req, res, next) {
  var newLessonData = req.body;

  savePhotoForSpecifiedData(newLessonData, 'lesson');

  Lesson.create(newLessonData, function (err, lesson) {
    if (err) {
      console.log(err);
      err.status = 400;
      return next(err);
    } else {
      var result = {};
      result.data = lesson;
      result.code = 200;
      return res.json(result);
    }
  });
};

exports.modifyLesson = function (req, res, next) {
  var lessonID = req.params.id;
  var updatedLessonData = req.body;
  delete updatedLessonData._id;

  savePhotoForSpecifiedData(updatedLessonData, 'lesson');

  Lesson.update({_id: lessonID}, updatedLessonData, function (err, numberAffected, rawResponse) {
    if (err) {
      err.status = 400;
      return next(err);
    } else {
      Lesson.findOne({_id: lessonID}, function (err, lesson) {
        if (err) {
          err.status = 400;
          return next(err);
        } else {
          var result = {};
          result.data = lesson;
          result.code = 200;
          return res.json(result);
        }
      });
    }
  });
};

exports.removeLesson = function (req, res, next) {
  var lessonID = req.params.id;
  Lesson.remove({'_id': lessonID}, function (err, product) {
    if (err) {
      err.status = 400;
      return next(err);
    } else {
      var result = {};
      result.data = lessonID;
      result.code = 200;
      return res.json(result);
    }
  });
};

exports.getAllLessonPromotions = function (req, res, next) {
  LessonPromotion.find({}, function (err, lessonPromotions) {
    if (err) {
      err.status = 400;
      return next(err);
    } else {
      var result = {};
      result.data = lessonPromotions;
      result.code = 200;
      return res.json(result);
    }
  });
};

exports.createLessonPromotion = function (req, res, next) {
  var newLessonPromotionData = req.body;

  Lesson.findOne({_id: newLessonPromotionData.lessonId}, function (err, lesson) {
    if (err) {
      err.status = 400;
      return next(err);
    } else {
      if (lesson) {
        LessonPromotion.create(newLessonPromotionData, function (err, lessonPromotion) {
          if (err) {
            console.log(err);
            err.status = 400;
            return next(err);
          } else {
            var result = {};
            result.data = lessonPromotion;
            result.code = 200;
            return res.json(result);
          }
        });
      } else {
        err.status = 400;
        return next(err);
      }
    }
  });
};

exports.modifyLessonPromotion = function (req, res, next) {
  var lessonPromotionID = req.params.id;
  var updatedLessonPromotionData = req.body;
  delete updatedLessonPromotionData._id;

  Lesson.findOne({_id: updatedLessonPromotionData.lessonId}, function (err, lesson) {
    if (err) {
      err.status = 400;
      return next(err);
    } else {
      if (lesson) {
        LessonPromotion.update({_id: lessonPromotionID}, updatedLessonPromotionData, function (err, numberAffected, rawResponse) {
          if (err) {
            err.status = 400;
            return next(err);
          } else {
            LessonPromotion.findOne({_id: lessonPromotionID}, function (err, lessonPromotion) {
              if (err) {
                err.status = 400;
                return next(err);
              } else {
                var result = {};
                result.data = lessonPromotion;
                result.code = 200;
                return res.json(result);
              }
            });
          }
        });
      } else {
        err.status = 400;
        return next(err);
      }
    }
  });
};

exports.removeLessonPromotion = function (req, res, next) {
  var lessonPromotionID = req.params.id;
  LessonPromotion.remove({'_id': lessonPromotionID}, function (err, product) {
    if (err) {
      err.status = 400;
      return next(err);
    } else {
      var result = {};
      result.data = lessonPromotionID;
      result.code = 200;
      return res.json(result);
    }
  });
};

exports.getUnconfirmedOrders = function (req, res, next) {
  co(function * () {
      try {
        var unconfirmedOrders = {};

        unconfirmedOrders.courseOrders = yield CourseOrder.find({state: ORDERSTATE.WAITTING_TO_COMFIRM}).exec();
        unconfirmedOrders.drivingRangeOrders = yield DrivingRangeOrder.find({state: ORDERSTATE.WAITTING_TO_COMFIRM}).exec();
        unconfirmedOrders.lessonOrders = yield LessonOrder.find({state: ORDERSTATE.WAITTING_TO_COMFIRM}).exec();

        var result = {};
        result.data = unconfirmedOrders;
        result.code = 200;
        return res.json(result);
      } catch (err) {
        return next(err);
      }
    }
  )
  ;
};

exports.confirmOrder = function (req, res, next) {
  var selectedTypeOrderID = req.body.id;
  var type = req.body.type;
  var model = null;
  switch (type) {
    case 0:
      model = CourseOrder;
      break;
    case 1:
      model = DrivingRangeOrder;
      break;
    case 2:
      model = LessonOrder;
      break;
    default:
  }
  model.update({_id: selectedTypeOrderID}, {$set: {state: ORDERSTATE.WAITTING_TO_PAY}}, function (err, raw) {
    if (err) {
      err.status = 400;
      return next(err);
    } else {
      Order.update({realOrderId: selectedTypeOrderID}, {$set: {state: ORDERSTATE.WAITTING_TO_PAY}}, function (err, raw) {
        if (err) {
          err.status = 400;
          return next(err);
        } else {
          var result = {};
          result.data = {id: selectedTypeOrderID, type: type};
          result.code = 200;

          //send confirm wechat message and phone message
          model.findOne({_id: result.data.id}).populate('ownerId', 'wechatOpenId').exec(function (err, order) {
            if (err) {
              err.status = 400;
              return next(err);
            } else {
              order.order_id = selectedTypeOrderID;
              switch (type) {
                case 0:
                  messageNotify.confirmedCourseOrderSuccess(order);
                  break;
                case 1:
                  messageNotify.confirmedDrivingRangeOrderSuccess(order);
                  break;
                case 2:
                  messageNotify.confirmedLessonOrderSuccess(order);
                  break;
                default:
              }
            }
          });

          return res.json(result);
        }
      });
    }
  });
};

exports.cancelOrder = function (req, res, next) {
  var selectedTypeOrderID = req.body.id;
  var type = req.body.type;
  var model = null;
  switch (type) {
    case 0:
      model = CourseOrder;
      break;
    case 1:
      model = DrivingRangeOrder;
      break;
    case 2:
      model = LessonOrder;
      break;
    default:
  }

  co(function * () {
      try {
        var selectedTypeOrder = yield model.findOne({_id: selectedTypeOrderID}).exec();
        console.log(selectedTypeOrder);

        var result = {};

        if (ORDERSTATE.CANCEL == selectedTypeOrder.state
          || ORDERSTATE.USERCANCEL == selectedTypeOrder.state) {
          result.data = "已经取消过";
        } else if (1 == selectedTypeOrder.payType
          && (ORDERSTATE.READY_TO_JOIN == selectedTypeOrder.state
          || ORDERSTATE.COMPLETE == selectedTypeOrder.state)) {
          result.data = "已开团,不能取消";
        } else {
          yield model.update({_id: selectedTypeOrderID}, {$set: {state: ORDERSTATE.CANCEL}}).exec();
          var newOrder = yield Order.update({realOrderId: selectedTypeOrderID}, {$set: {state: ORDERSTATE.CANCEL}}, {multi: true}).exec();
          result.data = {id: selectedTypeOrderID, type: type};

          //send cancel wechat message and phone message
          var cancelOrder = yield model.findOne({_id: selectedTypeOrderID}).populate('ownerId', 'wechatOpenId').exec();
          var order = {
            openId: cancelOrder.ownerId.wechatOpenId,
            phoneNumber: cancelOrder.phoneNumber,
            order_id: selectedTypeOrderID
          };
          switch (type) {
            case 0:
              order.courseOrderId = cancelOrder.referenceId;
              messageNotify.cancelCourseOrderSuccess(order);
              break;
            case 1:
              order.drivingRangeOrderId = cancelOrder.referenceId;
              messageNotify.cancelDrivingRangeOrderSuccess(order);
              break;
            case 2:
              order.lessonOrderId = cancelOrder.referenceId;
              messageNotify.cancelLessonOrderSuccess(order);
              break;
            default:
          }
        }

        result.code = 200;
        return res.json(result);
      } catch (err) {
        return next(err);
      }
    }
  )
  ;
};

exports.getAllOrders = function (req, res, next) {
  co(function * () {
      try {
        var orders = {};

        orders.courseOrders = yield CourseOrder.find().exec();
        orders.drivingRangeOrders = yield DrivingRangeOrder.find().exec();
        orders.lessonOrders = yield LessonOrder.find().exec();

        var result = {};
        result.data = orders;
        result.code = 200;
        return res.json(result);
      } catch (err) {
        return next(err);
      }
    }
  )
  ;
};

/*
 * 用户列表处理部分
 * */

//get all user
exports.getAllUsers = function (req, res, next) {
  User.find({}, function (err, users) {
    if (err) {
      err.status = 400;
      return next(err);
    } else {
      var result = {};
      result.data = users;
      result.code = 200;
      return res.json(result);
    }
  });
};

//set master and commissionRate
exports.setUserToRecommendMaster = function (req, res, next) {
  co(function *(){
    try {
      var user = yield User.findOne({
        _id: req.body.id
      }).exec();
    }catch (e){
      throw e;
    }

    if(!user){
      throw new Error('User Not Found');
    }

    var originIsMaster = user.isMaster;

    user.isMaster = true;
    user.commissionRate = req.body.commissionRate;

    try {
      var savedUser = yield user.save();
    }catch (e){
      throw e;
    }

    if(!savedUser){
      throw new Error('Save User Error');
    }

    var master = {
      wechatOpenId: savedUser.wechatOpenId,
      nickname: savedUser.nickname,
      phoneNumber: savedUser.phoneNumber
    };

    if(!originIsMaster) {
      messageNotify.settingMasterSuccess(master);

      masterPoster.generatePoster(user.id);
    }

    var result = {
      data: savedUser,
      code: 200
    };
    return res.json(result);
  }).catch(function(err){
    console.log(err);
    return res.json({
      data: null,
      code: 500
    });
  });
};

//change commissionRate
exports.changeMasterCommission = function (req, res, next) {
  var userID = req.params.id;
  var updatedData = req.body;

  User.update({_id: userID}, updatedData, function (err, query) {
    if (err) {
      err.status = 400;
      return next(err);
    } else {
      User.findOne({_id: userID}, function (err, user) {
        if (err) {
          err.status = 400;
          return next(err);
        } else {
          var result = {};
          result.data = user;
          result.code = 200;
          return res.json(result);
        }
      });
    }
  });
};

//cancel master
exports.cancelUserRecommendMaster = function (req, res, next) {
  var userID = req.params.id;
  var updatedUserData = {'isMaster': false, 'commissionRate': 0};

  User.update({_id: userID}, updatedUserData, function (err, query) {
    if (err) {
      err.status = 400;
      return next(err);
    } else {
      User.findOne({_id: userID}, function (err, user) {
        if (err) {
          err.status = 400;
          return next(err);
        } else {
          var result = {};
          result.data = user;
          result.code = 200;
          return res.json(result);
        }
      });
    }
  });
};


//get unconfirmed commission
exports.getUnconfirmedCommission = function (req, res, next) {
  Commission.find({state: 3, payDate: null}).populate('refereeId', 'nickname').exec(function (err, commission) {
    if (err) {
      err.status = 400;
      return next(err);
    } else {
      var result = {};
      result.data = commission;
      result.code = 200;
      return res.json(result);
    }
  });
};

//get all commission
exports.getAllCommission = function (req, res, next) {
  Commission.find().populate('refereeId', 'nickname').exec(function (err, commission) {
    if (err) {
      err.status = 400;
      return next(err);
    } else {
      var result = {};
      result.data = commission;
      result.code = 200;
      return res.json(result);
    }
  });
};

//send sms
exports.sendSMSToMaster = function (req, res, next) {
  var masterMoblie = req.body.mobile;
  var smsContent = req.body.smsContent;
  sms.sendSMS(masterMoblie, smsContent, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body);
      return res.send(body);
    }
  });
};


/*function savePhotoForSpecifiedData(specifiedData, directoryName) {
 if (specifiedData.photoData&&
 (specifiedData.photoType == "png"
 || specifiedData.photoType == "jpg"
 || specifiedData.photoType == "jpeg")) {
 var specifiedPhotosDirPath = './public/photos/' + directoryName + '/';
 var specifiedPhotosUrlPath = '/photos/' + directoryName + '/';

 var timestamp = new Date().getTime();
 var randomName = timestamp + randomString(10);

 var photoName = randomName + "." + specifiedData.photoType;
 var thumbnailPhotoName = randomName + "_thumbnail." + specifiedData.photoType;

 var photoFilePath = specifiedPhotosDirPath + photoName;
 var thumbnailPhotoFilePath = specifiedPhotosDirPath + thumbnailPhotoName;

 ensureDirectoryExistence(photoFilePath);

 var photoData = specifiedData.photoData.substr(specifiedData.photoData.indexOf(',') + 1);
 var photoDataBuffer = new Buffer(photoData, 'base64');

 fs.writeFileSync(photoFilePath, photoDataBuffer);

 gm(photoDataBuffer).resize(216, 216).write(thumbnailPhotoFilePath, function (err) {
 if (err) console.log(err);
 });

 var photoUrlPath = specifiedPhotosUrlPath + photoName;
 var thumbnailPhotoUrlPath = specifiedPhotosUrlPath + thumbnailPhotoName;

 specifiedData.photos = [];
 specifiedData.photos.push(photoUrlPath);
 specifiedData.thumbnail = thumbnailPhotoUrlPath;
 }
 }*/

function savePhotoForSpecifiedData(specifiedData, DataType) {
  var imgObj = {};
  var imgDirectoryName = DataType;

  if (specifiedData.photoData) {
    imgObj.imgData = specifiedData.photoData;
    imgObj.imgType = specifiedData.photoType;
    var imgUrlPath = replaceToSpectifiedData(imgObj, imgDirectoryName);
    specifiedData.photos = [];
    specifiedData.photos.push(imgUrlPath);
  }
  if (specifiedData.iconData) {
    imgObj.imgData = specifiedData.iconData;
    imgObj.imgType = specifiedData.iconType;
    var imgUrlPath = replaceToSpectifiedData(imgObj, imgDirectoryName + '_icon');
    specifiedData.thumbnail = imgUrlPath;
  }
}

////////////
function replaceToSpectifiedData(imageData, imageDirectoryName) {
  var specifiedPhotosDirPath = './public/photos/' + imageDirectoryName + '/';
  var specifiedPhotosUrlPath = '/photos/' + imageDirectoryName + '/';

  var timestamp = new Date().getTime();
  var randomName = timestamp + randomString(10);

  var imgName = randomName + "_" + imageDirectoryName + "." + imageData.imgType;
  var imgFilePath = specifiedPhotosDirPath + imgName;

  ensureDirectoryExistence(imgFilePath);

  var imgData = imageData.imgData.substr(imageData.imgData.indexOf(',') + 1);
  var imgDataBuffer = new Buffer(imgData, 'base64');

  fs.writeFileSync(imgFilePath, imgDataBuffer);

  //gm(photoDataBuffer).resize(216, 216).write(thumbnailPhotoFilePath, function (err) {
  //    if (err) console.log(err);
  //});

  var imgUrlPath = specifiedPhotosUrlPath + imgName;
  return imgUrlPath;
}

function randomString(len) {
  len = len || 32;
  var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  var maxPos = $chars.length;
  var pwd = '';
  for (i = 0; i < len; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
}

function ensureDirectoryExistence(filePath) {
  var dirname = path.dirname(filePath);
  if (directoryExists(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

function directoryExists(path) {
  try {
    return fs.statSync(path).isDirectory();
  }
  catch (err) {
    return false;
  }
}
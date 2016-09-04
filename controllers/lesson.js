/**
 * Created by qxj on 16/2/4.
 */
var wechatCore = require('wechat-core');
var Lesson = require('../models/lesson');
var LessonPromotion = require('../models/lesson-promotion');
var co = require('co');

exports.getLesson = function(req, res, next){
  co(function *(){
    try {
      var lesson = yield Lesson.findOne({
        inStock: true
      }).exec();

      if(!lesson){
        var notFound = new Error('Not Found');
        notFound.status = 404;
        return next(notFound);
      }

      var promotion = yield LessonPromotion.findOne({
        lessonId: lesson.id,
        inStock: true
      }).exec();

      var url = 'http://' + req.hostname + req.originalUrl.split('#')[0];
      var shareMessage = {
        title: lesson.title,
        desc: lesson.description,
        link: url,
        imgUrl: 'http://http://sugars.vicp.cc' + lesson.thumbnail
      };

      var wechatConfigForFrontPage = wechatCore.getConfigForFrontPage(url);

      return res.render('lesson-detail', {lesson: lesson, promotion: promotion, shareMessage: shareMessage, wechatConfig: wechatConfigForFrontPage});
    } catch (e) {
      e.status = 500;
      throw e;
    }
  }).catch(function(err){
    return next(err);
  });
};
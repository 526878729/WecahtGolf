var express = require('express');
var router = express.Router();
var admin = require('../controllers/admin');

router.use(function (req, res, next) {
  var url = req.originalUrl;
  if (url != "/admin/login" && !req.session.adminID) {
    return res.render('admin-login-input');
  } else {
    next();
  }
});

router.post('/login', admin.login);
router.get('/logout', admin.logout);

router.get('/courses', admin.getAllCourses);
router.post('/courses', admin.createCourse);
router.put('/courses/:id', admin.modifyCourse);
router.delete('/courses/:id', admin.removeCourse);

router.get('/drivingRanges', admin.getAllDrivingRanges);
router.post('/drivingRanges', admin.createDrivingRange);
router.put('/drivingRanges/:id', admin.modifyDrivingRange);
router.delete('/drivingRanges/:id', admin.removeDrivingRange);

router.get('/lessons', admin.getAllLessons);
router.post('/lessons', admin.createLesson);
router.put('/lessons/:id', admin.modifyLesson);
router.delete('/lessons/:id', admin.removeLesson);

router.get('/lessonPromotions', admin.getAllLessonPromotions);
router.post('/lessonPromotions', admin.createLessonPromotion);
router.put('/lessonPromotions/:id', admin.modifyLessonPromotion);
router.delete('/lessonPromotions/:id', admin.removeLessonPromotion);

//用户列表部分
router.get('/users', admin.getAllUsers);
router.post('/users', admin.setUserToRecommendMaster);
router.put('/users/:id', admin.changeMasterCommission);
router.delete('/users/:id', admin.cancelUserRecommendMaster);


//commission
router.get('/unconfirmedCommission', admin.getUnconfirmedCommission);
router.get('/commission', admin.getAllCommission);

router.get('/unconfirmedOrders', admin.getUnconfirmedOrders);
router.get('/orders', admin.getAllOrders);

router.post('/confirmOrder', admin.confirmOrder);
router.post('/cancelOrder', admin.cancelOrder);

router.get('/*', admin.showPanel);

module.exports = router;

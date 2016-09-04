/**
 * Created by Ryan on 16/1/12.
 */
var express = require('express');
var router = express.Router();
var courseOrder = require('../controllers/course-order');
var drivingRangeOrder = require('../controllers/driving-range-order');
var lessonOrder = require('../controllers/lesson-order');
var order = require('../controllers/order');

router.get('/', order.getUserOrders);
router.put('/pay', order.payOrder);

router.get('/detail/course/:id', courseOrder.getCourseOrderDetail);

router.post('/course', courseOrder.addCourseOrder);
router.put('/course/join', courseOrder.joinCourseOrder);
router.put('/course/cancel', courseOrder.cancelCourseOrder);
router.put('/course/update', courseOrder.updateCourseOrder);

//router.get('/invite-friend', order.inviteFriend);

router.get('/detail/drivingrange/:id', drivingRangeOrder.getDrivingRangeOrderDetail);

router.post('/drivingrange', drivingRangeOrder.addDrivingRangeOrder);
router.put('/drivingrange/join', drivingRangeOrder.joinDrivingRangeOrder);
router.put('/drivingrange/cancel', drivingRangeOrder.cancelDrivingRangeOrder);
router.put('/drivingrange/update', drivingRangeOrder.updateDrivingRangeOrder);

router.get('/detail/lesson/:id', lessonOrder.getLessonOrderDetail);

router.post('/lesson', lessonOrder.addLessonOrder);

module.exports = router;
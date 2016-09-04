/**
 * Created by qxj on 16/2/23.
 */
var express = require('express');
var router = express.Router();
var lessonOrder = require('../controllers/lesson-order');

router.get('/lastcontact', lessonOrder.getLastLessonOrderContact);

router.put('/', lessonOrder.updateLessonOrder);
router.post('/join', lessonOrder.joinGroupLessonOrder);
router.put('/group/:id', lessonOrder.setLessonOrderIsGroup);

module.exports = router;
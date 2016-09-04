/**
 * Created by qxj on 16/2/4.
 */
var express = require('express');
var router = express.Router();
var lesson = require('../controllers/lesson');

router.get('/', lesson.getLesson);

module.exports = router;
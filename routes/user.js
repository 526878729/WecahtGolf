var express = require('express');
var router = express.Router();
var user = require('../controllers/user');

router.get('/', user.getUser);
router.get('/referee', user.getreferee);
router.get('/referee/poster', user.getPoster);

module.exports = router;

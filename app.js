var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var xmlParser = require('express-xml-bodyparser');
var swig = require('swig');
var mongoose = require('mongoose');
var expressValidator = require('express-validator');
var session = require('express-session');
var wechatCore = require('wechat-core');

var config = require('./config');

var routes = require('./routes/index');
var admin = require('./routes/admin');
var user = require('./routes/user');
var course = require('./routes/course');
var courseOrder = require('./routes/course-order');
var drivingRange = require('./routes/driving-range');
var drivingRangeOrder = require('./routes/driving-range-order');
var weather = require('./routes/weather');
var order = require('./routes/order');
var notify = require('./routes/notify');
var lesson = require('./routes/lesson');
var lessonOrder = require('./routes/lesson-order');

var userController = require('./controllers/user');

var app = express();

app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: true
}));

// view engine setup
app.engine('.html', swig.renderFile);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

app.set('view cache', false);
swig.setDefaults({
  cache: false
});

// mongodb connection
mongoose.connect(config.dbPath);

//wechat config
wechatCore.configure(config.wechatConfig);
//wechatCore.createMenu(config.wechatMenu);
//wechatCore.getAppAccessToken();

app.use(logger('dev'));
app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(xmlParser());
app.use(expressValidator());
app.use(cookieParser(config.cookieSecret));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next){
  var ua = req.headers['user-agent'];

  var wechat = ua.match(/micromessenger\/\d+\.\d+/i);
  var version = false;

  if(wechat) {
    version = String(wechat).split('/');
    version = parseInt(version[1].split('.')[0]);
    req.isFromWechat = version >= 5 ? true : false;
  }

  next();
});

//set default var
app.use(function (req, res, next) {
  res.locals.preset = config.preset;

  next();
});

app.use('/notify', notify);

app.use(userController.autoLogin);

app.use('/', routes);
app.use('/admin', admin);
app.use('/user', user);
app.use('/course', course);
app.use('/drivingrange', drivingRange);
app.use('/weather', weather);
app.use('/order', order);
app.use('/lesson', lesson);
app.use('/course-order', courseOrder);
app.use('/driving-range-order', drivingRangeOrder);
app.use('/lesson-order', lessonOrder);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

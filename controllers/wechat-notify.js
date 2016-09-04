/**
 * Created by qxj on 16/3/8.
 */
var co = require('co');
var xml2js = require('xml2js');
var xmlBuilder = new xml2js.Builder({
  rootName: 'xml'
});
var wechatCore = require('wechat-core');
var wechatEventService = require('../services/wechat-event');

exports.checkServer = function(req, res, next){
  res.set('Content-Type', 'text/html;charset=utf-8');
  var signature = req.query.signature;
  var timestamp = req.query.timestamp;
  var nonce = req.query.nonce;
  var echostr = req.query.echostr;
      
  if(wechatCore.checkSignature(signature, timestamp, nonce)){
    return res.send(echostr);
  }
  
  return res.send('fail');
};

exports.handleNotifyFromWechat = function(req, res, next){
  var signature = req.query.signature;
  var timestamp = req.query.timestamp;
  var nonce = req.query.nonce;
  
  if(!wechatCore.checkSignature(signature, timestamp, nonce)){
    return res.send('fail');
  }
  
  var data = req.body;

  data = wechatCore.removeCdata(data.xml);

  var returnMessage = {
    ToUserName: data.fromusername,
    FromUserName: data.tousername,
    CreateTime: parseInt((new Date()).getDate() / 1000),
    MsgType: 'text',
    Content: ''
  };

  var messageType = data['msgtype'].toLowerCase();

  switch(messageType){
    case 'event':
      var eventType = data.event.toLowerCase();
      if(wechatEventService[eventType]){
        wechatEventService[eventType](data, function(message){
          if(!message){
            return res.send(' ');
          }
          returnMessage.Content = message;
          var xml = xmlBuilder.buildObject(returnMessage);
          res.set('Content-Type', 'text/xml');
          return res.send(xml);
        });
      } else {
        return res.send(' ');
      }
      break;
    default:
      return res.send(' ');
  }
};
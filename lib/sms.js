/**
 * Created by qxj on 16/2/26.
 */
var request = require('request');

var apiUrl = "http://sms.gaoshougolf.com/sms.php";

exports.generateCode = function(length){
  var digit = 1;
  for(var i = 0; i < length; i++){
    digit = digit * 10;
  }
  
  var code = parseInt(Math.random() * digit);
  code = String(code);
  while(code.length < length){
    code += '0';
  }

  return code;
};

exports.sendSMS = function(mobile, content, callback){
  var form = {
    mobile: mobile,
    content: content
  };

  request.post({
    url: apiUrl,
    form: form
  }, callback);
};
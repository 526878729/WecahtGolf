/**
 * Created by qxj on 16/3/16.
 */
var request = require('request');
var fs = require('fs');

exports.download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};
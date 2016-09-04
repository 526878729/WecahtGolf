/**
 * Created by Waley Wen on 16/01/12.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AdminSchema = new Schema({
  username: String,
  hashedPassword: String,
}, {
  versionKey: false
});

var Admin = mongoose.model('Admin', AdminSchema);

module.exports = Admin;
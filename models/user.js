/**
 * Created by qxj on 15/12/23.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var UserSchema = new Schema({
  wechatOpenId: String,
  nickname: String,
  sex: Number,
  country: String,
  province: String,
  city: String,
  avatar: String,
  phoneNumber: String,
  followed: Boolean,
  followedDate: Date,
  isMaster: Boolean,
  commissionRate: {type: Number, default: 0},
  refereeId: {type: Schema.Types.ObjectId, ref: 'User'},
  masterQRCode: {
    ticket: String,
    url: String
  }
});

var User = mongoose.model('User', UserSchema);

module.exports = User;
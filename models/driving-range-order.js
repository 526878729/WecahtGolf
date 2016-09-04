/**
 * Created by 2nd on 16/2/14.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  Counter = require('./counter'),
  randomString = require('random-string');

var DrivingRangeOrderSchema = new Schema({
  ownerId: {type: Schema.Types.ObjectId, ref: 'User'},
  drivingRangeId: {type: Schema.Types.ObjectId, ref: 'DrivingRange'},
  drivingRangeName: String,
  drivingRangePhoneNumber: String,
  referenceId: String,
  bookingDate: Date,
  expiredDate: Date,
  name: String,
  phoneNumber: String,
  numberOfPeople: Number,
  paidNumOfPeople: Number,
  joinedNumPeople: Number,
  message: String,
  payType: Number,
  fees: Number,
  state: Number,
  creationDate: {type: Date, default: Date.now}
});

DrivingRangeOrderSchema.pre('save', function(next){
  var order = this;

  if(order.isNew) {
    var prefix = ((new Date()).getTime() / 1000).toFixed(0);
    prefix = '2' + prefix;

    Counter.findOneAndUpdate({
      model: 'drivingRange',
      prefix: prefix,
      createDate: new Date()
    }, {$inc: {seq: 1}}, {new: true, upsert: true}, function (err, counter) {
      if (err) {
        next(err);
      }

      var end = randomString({
        length: 2,
        numeric: true,
        letters: false,
        special: false
      });

      order.referenceId = prefix + counter.seq + end;
      next();
    });
  }else{
    next();
  }
});

var DrivingRangeOrder = mongoose.model('DrivingRangeOrder', DrivingRangeOrderSchema);

module.exports = DrivingRangeOrder;
/**
 * Created by Ryan on 16/1/12.
 */

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  Counter = require('./counter'),
  randomString = require('random-string');

var CourseOrderSchema = new Schema({
  ownerId: {type: Schema.Types.ObjectId, ref: 'User'},
  courseId: {type: Schema.Types.ObjectId, ref: 'Course'},
  courseName: String,
  coursePhoneNumber: String,
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

CourseOrderSchema.pre('save', function(next){
  var order = this;

  if(order.isNew) {
    var prefix = ((new Date()).getTime() / 1000).toFixed(0);
    prefix = '1' + prefix;

    Counter.findOneAndUpdate({
      model: 'course',
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

var CourseOrder = mongoose.model('CourseOrder', CourseOrderSchema);

module.exports = CourseOrder;


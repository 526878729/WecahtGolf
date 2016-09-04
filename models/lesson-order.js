/**
 * Created by qxj on 16/2/5.
 */

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  Counter = require('./counter'),
  randomString = require('random-string');

var LessonOrderSchema = new Schema({
  ownerId: {type: Schema.Types.ObjectId, ref: 'User'},
  lessonId: {type: Schema.Types.ObjectId, ref: 'Lesson'},
  lessonName: String,
  lessonPhoneNumber: String,
  promotionId: {type: Schema.Types.ObjectId, ref: 'LessonPromotion'},
  referenceId: String,
  bookingDate: Date,
  name: String,
  phoneNumber: String,
  numberOfPeople: Number,
  paidNumOfPeople: Number,
  joinedNumPeople: Number,
  isGroup: Boolean,
  message: String,
  payType: Number,
  fees: Number,
  total: Number,
  state: Number,
  creationDate: {type: Date, default: Date.now}
});

LessonOrderSchema.pre('save', function(next){
  var order = this;

  if(order.isNew) {
    var prefix = ((new Date()).getTime() / 1000).toFixed(0);
    prefix = '3' + prefix;

    Counter.findOneAndUpdate({
      model: 'lesson',
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

var LessonOrder = mongoose.model('LessonOrder', LessonOrderSchema);

module.exports = LessonOrder;
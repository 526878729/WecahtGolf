/**
 * Created by Waley Wen on 15/02/12.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LessonPromotionSchema = new Schema({
  lessonId: {type: Schema.Types.ObjectId, ref: 'Lesson'},
  title: String,
  activityDate: Date,
  fees: Number,
  inStock: Boolean,
  creationDate: {type: Date, default: Date.now}
});

var LessonPromotion = mongoose.model('LessonPromotion', LessonPromotionSchema);

module.exports = LessonPromotion;
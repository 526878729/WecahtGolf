/**
 * Created by qxj on 16/2/4.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var LessonSchema = new Schema({
  title: String,
  type: Number,
  thumbnail: String,
  photos: [],
  description: String,
  fees: Number,
  dateStart: Date,
  dateEnd: Date,
  address: String,
  geospatial: [],
  inStock: Boolean
});

var Lesson = mongoose.model('Lesson', LessonSchema);

module.exports = Lesson;
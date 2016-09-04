/**
 * Created by Ryan on 16/1/12.
 */

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var OrderSchema = new Schema({
  realOrderId: String,
  orderType: Number,
  userId: {type: Schema.Types.ObjectId, ref: 'User'},
  ownerId: {type: Schema.Types.ObjectId, ref: 'User'},
  title: String,
  numberOfPeople: Number,
  fees: Number,
  state: Number,
  stateLogs: [],
  thumbnail: String,
  photos: [],
  total: Number,
  promotion: Boolean,
  payment: {type: Schema.Types.ObjectId, ref: 'Payment'},
  creationDate: {type: Date, default: Date.now}
});

var Order = mongoose.model('Order', OrderSchema);

module.exports = Order;

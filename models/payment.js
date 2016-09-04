/**
 * Created by qxj on 16/2/5.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var PaymentSchema = new Schema({
  orderId: {type: Schema.Types.ObjectId, ref: 'Order'},
  product: String,
  type: String,
  tradeNo: String,
  status: String,
  detail: Object,
  notify: [],
  createDate: {type: Date, default: Date.now}
});

var Payment = mongoose.model('Payment', PaymentSchema);

module.exports = Payment;
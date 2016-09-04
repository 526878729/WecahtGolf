/**
 * Created by Leo on 2016/3/7.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var CommissionSchema = new Schema({
  orderId: {type: Schema.Types.ObjectId, ref: 'Order'},
  orderTitle: String,
  consumerId: {type: Schema.Types.ObjectId, ref: 'User'},
  refereeId: {type: Schema.Types.ObjectId, ref: 'User'},
  orderTotal: Number,
  fees: Number,
  state: Number,
  payDate: Date,
  commissionRate: Number,
  creationDate: {type: Date, default: Date.now}
});

var Commission = mongoose.model('Commission', CommissionSchema);

module.exports = Commission;

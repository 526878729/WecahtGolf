/**
 * Created by 2nd on 16/1/25.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  mongoosePaginate = require('mongoose-paginate');

var DrivingRangeSchema = new Schema({
  name: String,
  nickname: String,
  type: String,
  establishedDate: Date,
  acreage: Number,
  puttingGreenGrass: String,
  holes: Number,
  par: Number,
  designer: String,
  yardage: Number,
  fairwayGrass: String,
  province: String,
  city: String,
  address: String,
  geospatial: [],
  phoneNumber: String,
  introduction: String,
  official: Boolean,
  priority: Number,
  teeTimesStart: Number,
  teeTimesEnd: Number,
  advanceReservationStart: Number,
  advanceReservationEnd: Number,
  fees: Number,
  rebate: Number,
  thumbnail: String,
  photos: [],
  creationDate: {type: Date, default: Date.now},
  enabled: Boolean
});

DrivingRangeSchema.plugin(mongoosePaginate);

DrivingRangeSchema.index({ 'geospatial': '2dsphere' });

DrivingRangeSchema.statics.searchByGeospatial = function(geospatial, diffFromNow, diffFromMidNight, drivingRangeName, sort){
  var aggregate = [
    {
      '$geoNear': {
        'near': {
          'type': 'Point',
          'coordinates': geospatial
        },
        'spherical': true,
        'distanceField': 'distance'
      }
    }
  ];

  var match = {
    enabled: true
  };

  if(drivingRangeName){
    match.name = {$regex: drivingRangeName, $options: 'i'};
  }

  if(diffFromNow){
    match.advanceReservationStart = {$lte: diffFromNow};
    match.advanceReservationEnd = {$gte: diffFromNow};
  }

  if(diffFromMidNight){
    match.teeTimesStart = {$lte: diffFromMidNight};
    match.teeTimesEnd = {$gte: diffFromMidNight};
  }

  aggregate.push(
    {
      $match: match
    }
  );

  aggregate.push(
    {
      $project: {
        _id: 1,
        name : 1,
        nickname: 1,
        type : 1,
        holes: 1,
        address: 1,
        geospatial: 1,
        fees: 1,
        rebate: 1,
        thumbnail: 1,
        distance: 1
      }
    }
  );

  switch (sort){
    case 'dis':
      aggregate.push({
        $sort: {
          distance: 1
        }
      });
      break;
    case 'fees':
      aggregate.push({
        $sort: {
          fees: 1
        }
      });
      break;
    default:
      aggregate.push({
        $sort: {
          _id: 1
        }
      });
      break;
  }

  return this.aggregate(aggregate);
};

var DrivingRange = mongoose.model('DrivingRange', DrivingRangeSchema);

module.exports = DrivingRange;
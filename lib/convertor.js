/**
 * Created by 2nd on 16/1/11.
 */

exports.convertGeospatialFromString = function(geospatial){
  if(!geospatial){
    return false;
  }

  var arr = geospatial.split(',');

  if (arr.length !== 2) {
    return false;
  }

  var longitude = parseFloat(arr[0]);
  var latitude = parseFloat(arr[1]);

  if (!isNaN(longitude) && !isNaN(latitude) && longitude >= -180 && longitude <=180 && latitude >=-90 && latitude <=90) {
    return [longitude, latitude];
  }

  return false;
};
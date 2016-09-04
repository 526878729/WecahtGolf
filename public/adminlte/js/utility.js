require([], function () {

});

function insertSpaceIntoString(originalString, numberOfLetterPerSpace) {
  var newString = '';
  if (numberOfLetterPerSpace === undefined) {
    numberOfLetterPerSpace = 4;
  }
  for (var i = 0; i < originalString.length; i += numberOfLetterPerSpace) {
    var remainingNumberOfLetter = originalString.length - i;
    if (i != 0) {
      newString += ' ';
    }
    if (remainingNumberOfLetter >= numberOfLetterPerSpace) {
      newString += originalString.substr(i, numberOfLetterPerSpace);
    } else {
      newString += originalString.substr(i, remainingNumberOfLetter);
    }
  }
  return newString;
}

function formatDate(date, format) {
  var o = {
    "M+": date.getMonth() + 1,
    "d+": date.getDate(),
    "h+": date.getHours(),
    "m+": date.getMinutes(),
    "s+": date.getSeconds(),
    "q+": Math.floor((date.getMonth() + 3) / 3),
    "S": date.getMilliseconds()
  };
  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
    }
  }
  return format;
}
/**
 * Created by Ryan on 16/1/11.
 */

var fs = require('fs');
var moment = require('moment');
var request = require("request");

var cityList = null;
var baduiApiKey = '3138b2742f8d7711949a6c21f79ef834';


/**
 * 获取客户端的ip地址
 */
var getClientIp = function (req) {
    return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
}

/**
 * 读取Json文件
 */
var readCityListJson = function  () {
    if (cityList == null) {
        cityList = JSON.parse(fs.readFileSync('./public/json/citylist.json'));
    }
}

/**
 * 根据 ip 获取获取地址信息.
 */
var getIpInfo = function(ip, callback) {
    request.get("http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=json&ip=" + ip, function (error, response, body) {
        if (!error && response.statusCode == 200)  {
            var province = JSON.parse(body).province;
            var city = JSON.parse(body).city;
            callback([province, city]);
        }
    });
}

/**
 * 获取城市代号.
 */
var getCityId = function(city){
    var cityid = '101010100';

    readCityListJson();

    var provinces = cityList["China"].province;
    for(var i = 0; i < provinces.length; i++){
        if(provinces[i]["city"][0]){
            var citys = provinces[i]["city"];
            for (var j = 0; j < citys.length; j++) {
                if(citys[j]["name"] == city){
                    if (citys[j]["county"][0]) {
                        cityid = citys[j]["county"][0]["weatherCode"];
                    } else {
                        cityid = citys[j]["county"]["weatherCode"];
                    }
                    return cityid;
                }
            };
        }else{
            var tempCity = provinces[i]["city"];
            if(tempCity["name"] == city) {
                cityid = tempCity["county"][0]["weatherCode"];
                return cityid;
            }
        }
    }
    return cityid;
}

/**
 * 获取指定省份的城市数据.
 */
var getCityListByProvince = function (province) {

    var citys = null;

    readCityListJson();

    var provinces = cityList["China"].province;
    for(var i = 0; i < provinces.length; i++){
        if(provinces[i]["name"] == province){
            citys = provinces[i]["city"];
            break;
        }
    }
    return citys;
}

/**
 * 获取当天天气数据.
 */

var getTodayWeatherInfo = function(cityid, callback){
    var requestUrl = "http://apis.baidu.com/apistore/weatherservice/cityid?cityid=" + cityid;
    var options = {
        url: requestUrl,
        headers: {
            "apikey": baduiApiKey
        }
    };

    request.get(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var weatherInfo = JSON.parse(body);
            callback(weatherInfo);
        }
    });
}

/**
 * 获取今天+未来四天天气数据.
 */
var getForecastWeatherInfo = function(cityid, callback){
    var requestUrl = "http://apis.baidu.com/apistore/weatherservice/recentweathers?cityid=" + cityid;
    var options = {
        url: requestUrl,
        headers: {
            "apikey": baduiApiKey
        }
    };

    request.get(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var weatherInfo = JSON.parse(body);
            callback(weatherInfo);
        }
    });
}

var renderTodayWeatherHTML = function (res, weatherInfo) {
    if  (weatherInfo) {
        var weatherArray = new Array();
        var cityName = weatherInfo.retData.city;
        var today = weatherInfo.retData;

        var weather = createWeatherObj ("今天", today.l_tmp,
          today.h_tmp, today.weather, today.WS.split("(")[0]);

        weatherArray.push(weather);

        return res.render('weather', {cityName: cityName,
            forecasts: weatherArray});

    }
}

var renderForecastWeatherHTML = function (res, weatherInfo) {
    if  (weatherInfo) {
        var weatherArray = new Array();
        var cityName = weatherInfo.retData.city;
        var today = weatherInfo.retData.today;

        var lowTemp = today.lowtemp.split("℃")[0];
        var highTemp = today.hightemp.split("℃")[0];

        var weather = createWeatherObj ("今天", lowTemp,
          highTemp, today.type, today.fengli);

        weatherArray.push(weather);

        var forecast = weatherInfo.retData.forecast;

        for (var i = 0; i < forecast.length; i++) {
            var futureWeather = forecast[i];
            var lowTemp = futureWeather.lowtemp.split("℃")[0];
            var highTemp = futureWeather.hightemp.split("℃")[0];

            if (futureWeather) {
                var date = futureWeather.date.split('-')[2] + "日";
                weatherArray.push(createWeatherObj(i== 0 ? "明天" : date, lowTemp,
                  highTemp, futureWeather.type, futureWeather.fengli));
            }
        }

        return res.render('weather', {cityName: cityName,
            forecasts: weatherArray});
    }
}

var createWeatherObj  = function (date, lowTemp, highTemp, state, wind) {
    var stateImg = "/img/img_weather_state_1.png";

    if (state == "晴") {
        stateImg = "/img/img_weather_state_2.png";
    }

    var weather = {
        date: date,
        lowTemp: lowTemp,
        highTemp: highTemp,
        state: state,
        wind: wind,
        stateImg: stateImg
    }
    return weather;
}

/**
 * 获取指定城市的天气.
 */
var getWeatherByCity = function (isForecast, req, res, city, callback) {
    if (city) {
        var cityid = getCityId(city);

        if (isForecast == true) {
            getForecastWeatherInfo(cityid, function (weatherInfo) {
                callback (weatherInfo);
            });
        } else {
            getTodayWeatherInfo(cityid, function (weatherInfo) {
                callback (weatherInfo);
            });
        }
    }
}

/**
 * 获取当前地区的天气.
 */
var getWeather = function (req, res) {

    var city = req.query.city;
    return res.render('weather', {city: city});

    return;
    /******* url不带参数 (ps. /weather?city=北京 ),默认获取本地天气 ****/
    /******* 获取未来几天数据: /weather?city=北京&forecast=1 ) ****/

    var city = req.query.city;
    var forecast = req.query.forecast ? true : false; //未来四天预报 (参数:任意)

    if (city) {
        getWeatherByCity(forecast, req, res, city, function (weatherInfo) {
            if (forecast == true) {
                renderForecastWeatherHTML (res, weatherInfo);
            } else {
                renderTodayWeatherHTML (res, weatherInfo);
            }
        });
        return;
    }

    /******************************/

    var ip = getClientIp(req);

    /**************内网测试使用****************/
    //var ip = '218.17.162.94';

    if (ip.indexOf(',') >= 0) {
        //公网获取到的ip (只有服务器在外网时才生效)
        ip = ip.split(',')[0];
    } else if (ip.indexOf('ffff') >= 0) {
        //判断是否与服务器同一局域网(内网测试),假如是直接返回固定的深圳ip
        ip = '218.17.162.94';
    }

    if(ip){ //有参数请求
        getIpInfo(ip, function(cityinfo) {
            var cityName = cityinfo[1];
            getWeatherByCity(forecast, req, res, cityName, function (weatherInfo) {
                if (forecast == true) {
                    renderForecastWeatherHTML (res, weatherInfo);
                } else {
                    renderTodayWeatherHTML (res, weatherInfo);
                }
            });
        });
    }
}

exports.getWeather = getWeather;

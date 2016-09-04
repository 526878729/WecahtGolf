/**
 * Created by qxj on 15/12/23.
 */
var config = {
  env: "development",
  staticMode: "express",
  cookieSecret: "5HgkO5z6GqmnpsZGVEznVXKJogkteTCLgSutWMsZ3aGEELZT0XFfqWjfvvGQDG2fQH6wVpLfXDXgonwgrqAoByeexa2bJtHlcFM6C0TxUemR7iV200WFT3NOr3LNb6lW",
  sessionSecret: "x0pgTxwLCDH0Phy5w6hweoIBqiH0TFpZG3EjI4WNZ2ws3W8Qf2os9JdcqGfksSNavWtXD8fdH1BCzIm8v0fxTggBKqUwINHH5MApCbKu1dv0xDW7DPvoaC6wPqguhzGs",
  cookieOption: {
    httpOnly: true,
    signed: true,
    maxAge: 30*24*60*60*1000
  },
  unsignedCookieOption: {
    httpOnly: true,
    maxAge: 30*24*60*60*1000
  },
  dbPath: "mongodb://localhost/golf",
  wechatConfig: {
    appid: "wx08134d21f39eab8b",
    secret: "f680ec89dfbd47d17b59cc010eab6b63",
    token: "x0pgTxwLCDH0Ph",
    key: "Gaoshougolf2015Gaoshougolf201588",
    mch_id: "1294037401",
    device_info: "WEB",
    notify_url: "http://sugars.vicp.cc/notify/wechat"
  },
  preset: {
    hotline: "888888888888"
  },
  wechatMenu: {
    "button":[
      {
        "type":"view",
        "name":"订场",
        "url":"http://sugars.vicp.cc/"
      },
      {
        "type":"view",
        "name":"入门",
        "url":"http://sugars.vicp.cc/lesson"
      },
      {
        "type":"view",
        "name":"我的",
        "url":"http://sugars.vicp.cc/user"
      }
    ]
  }
};

module.exports = config;
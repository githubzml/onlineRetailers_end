//配置层

//服务器配置
exports.serverOptions = {
  //地址
  host: 'http://localhost',
  //端口
  port: 10000
}

//mysql数据库配置
exports.mysqlOptions = {
  //数据库名称
  database: 'bbbdb',
  //用户名
  username: 'root',
  //密码
  password: '1q2w3e',

  //连接地址
  host: 'localhost',

  //连接数据库类型
  dialect: 'mysql',

  //时区
  timezone: '+08:00',

  pool: {
    //最大连接数
    max: 10,

    //最小连接数
    min: 0,

    //连接超时, 单位ms
    acquire: 30000,

    //闲置时间, 单位ms
    idle: 10000
  }
}

exports.saltOptions = {
  tokenSalt: "_tsalt"
}
//模型
//收集所有模型
let User = require(__basename + '/db/model/user.js');
let Code = require(__basename + '/db/model/code.js');
// 商品类型
let Type = require(__basename + '/db/model/type.js');

let Product = require(__basename + '/db/model/Product.js');

//导出模型
module.exports = {
  User,
  Code,
  Type,
  Product
}
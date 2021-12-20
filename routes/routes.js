//路由层

//导入路由控制器层
let routesController = require(__basename + '/routesController/routesController.js');

module.exports = (app) => {
  app.use(routesController.validCode)


  // 验证登录
  app.use(routesController.validLogin);

  //路由
  app.post('/register', routesController.register);
  //验证码
  app.post('/code', routesController.getCode);

  app.post('/login', routesController.login);

  // 获取用户信息
  app.post('/userInfo', routesController.getUserInfo);

  // 添加商品类型
  app.post('/addType', routesController.addType);

  app.get('/findType', routesController.findTypeData);

  app.post('/editType', routesController.editTypeData);

  app.post('/disableType', routesController.disableType);

  app.post('/enableType', routesController.enableType);


  app.post('/removeType', routesController.removeType);

  app.get('/count', routesController.count);

  app.get('/typeAll', routesController.getTypeAll);

  app.post('/addProduct', routesController.addProduct);

  app.get('/searchProduct', routesController.searchProduct);

  app.post('/proStatus', routesController.proStatus);

  app.post('/removePro', routesController.removePro);

  app.get('/viewProduct', routesController.viewProduct);

  app.post('/editProduct', routesController.editProduct);

  app.get('/proCount', routesController.getProductCount);

  app.post('/userImg', routesController.uploadUserImg);

  app.post('/nickname', routesController.updateNickName);

  app.post('/updatePwd', routesController.updatePwd);

  app.post('/forgot', routesController.forgot);
}
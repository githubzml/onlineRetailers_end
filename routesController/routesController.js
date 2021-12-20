//路由控制器

let api = require(__basename + "/api/api.js");

// 导入工具模块
let utils = require(__basename + '/utils/utils.js')

let whiteList = require(__basename + '/whiteList/whiteList.js')

// 获取一个操作符的引用
const { Op } = require("sequelize");

// 导入处理时间模块
let moment = require("moment");
function updateProduct(params, res) {
  // 移除多于属性
  delete params.token;

  // 更新商品数据
  let pid = params.pid;
  delete params.pid;
  api.updateData("Product", params, {
    pid
  }).then(result => {
    res.send({ msg: "修改商品成功", code: 1080, result })
  }).catch(err => {
    res.send("发布商品失败")
  })
}
class RoutesController {
  // 验证验证码
  validCode(req, res, next) {
    let url = req.url;
    // 需要验证 验证码的
    console.log('whiteList.codeList.includes(url)', whiteList.codeList.includes(url));

    if (whiteList.codeList.includes(url)) {
      // whiteList.codeList
      // 获取邮箱和输入的验证码
      let { email, code } = req.body;

      //5分钟
      let time = new Date() - 5 * 60 * 1000;
      let date = moment(time).format("YYYY-MM-DD HH:mm:ss");

      // 时间的有效期
      api.findData("Code", {
        email,
        code,
        createdAt: {
          [Op.gte]: date
        }
      }).then(result => {
        if (!result.length) {
          res.send({ msg: "验证码不正确", code: 102 })
        } else {
          // 验证通过
          next();
        }

      }).catch(err => {
        res.send({ msg: "xxx...", code: 201 })
      })
    } else {
      // 传递给下一个中间件或者路由
      next();
    }
  }
  // 中间件路由拦截 信息验证
  // 登录验证
  validLogin(req, res, next) {

    let url = req.url.split("?")[0];

    console.log('req1', url);

    if (whiteList.tokenList.includes(url)) {

      console.log('req2', url);
      // 截取token
      let token = req.body.token ? req.body.token : req.query.token;

      console.log('req3', token);

      // 验证token
      utils.verifyToken(token, (err, decode) => {
        if (err) {
          res.send({ msg: "无token信息", code: "303" })
        } else {
          // 以便下面也能用到
          req.userId = decode.data;
          next();
        }
      });
    } else {
      // 直接传递下去
      next();
    }

  }

  //注册
  register(req, res) {
    let { email, nickname, password, code } = req.body
    let userId = "_u" + new Date().getTime();
    let o = {
      userId,
      password,
      nickname,
      email
    }

    // 注册前 验证邮箱

    // 检测是否存在邮箱
    api.findData("User", {
      email
    }, ["user_id"]).then(result => {
      if (!result.length) {
        api.createData("User", o).then(result => {
          // 判断邮箱是否被注册过
          res.send({ msg: '注册成功', code: 100 });
        }).catch(err => {
          res.send({ msg: '注册失败', code: 101 });
        })
      } else {
        res.send({ msg: '邮箱已经被注册', code: 102 });
      }
    }).catch(err => {
      res.send({ msg: '注册失败', code: 101 });
    })
  }

  //发邮件
  getCode(req, res) {
    let email = req.body.email;
    let code = Math.random().toString().substr(2, 6);

    // 存储验证码 以便注册验证  
    api.createData("Code", { code, email }).then(result => {

      // 开发测试 不发邮件
      // res.send({ msg: "开发测试 不发邮件", code: 100, result: code });

      utils.sendEmail(email, code, (error, info) => {
        if (error) {
          res.send({ msg: "获取邮箱验证码失败", code: 201 });
        } else {
          res.send({ msg: "验证码已发送你的邮箱", code: 200 })
        }
      });

    }).catch(err => {
      res.send({ msg: "失败", code: 200 })
    })



  }

  login(req, res) {

    let { email, password } = req.body;
    // 根据邮箱 查询用户
    api.findData("User", {
      email
    }, ['userId', 'password']).then(result => {
      if (!result.length) {
        res.send({ msg: "邮箱未被注册", code: 200 })
      } else {
        // 密码匹配
        if (password == result[0].dataValues.password) {
          // 生成token
          let token = utils.signToken(result[0].dataValues.userId, "10d");
          res.send({ msg: "密码正确", code: 300, token })
        } else {
          res.send({ msg: "密码不正确", code: 302 })
        }
      }
    }).catch(err => {
      res.send({ msg: "失败", code: 201 })
    })
  }

  getUserInfo(req, res) {
    api.findData("User", {
      userId: req.userId
    }, ['nickname', 'url']).then(result => {
      res.send({ msg: "查询用户信息ok", code: 400, result })
    }).catch(err => {
      res.send({ msg: "查询失败", code: 401 })
    });
  }
  //添加商品类型
  addType(req, res) {
    let typeId = "_t" + new Date().getTime(); //保证ID唯一

    api.createData("Type", {
      typeId,
      userId: req.userId, //关联用户
      typeName: req.body.typeName
    }).then(result => {
      res.send({ msg: "添加商品类型成功", code: 200, result })
    }).catch(err => {
      res.send({ msg: "添加商品类型", code: 404 })
    })

  }

  // 查询商品类型数据
  findTypeData(req, res) {
    // 变量 :变量名
    // offset 偏移多少条
    // count 要查多少条
    // 注意 sql语句的写法

    let sql = "SELECT * FROM `type` WHERE `user_id` = :userId";

    //搜索
    if (req.query.typeName) {
      sql += " AND `type_name` LIKE '%" + req.query.typeName + "%'";
    }
    sql += " LIMIT :offset,:count";

    api.query(sql, {
      userId: req.userId,
      offset: Number(req.query.offset),
      count: Number(req.query.count),
    }).then(result => {
      res.send({ msg: "查询成功", code: 600, result })
    }).catch(err => {
      res.send({ msg: "查询失败", code: 601 });
    })
  }
  // 编辑商品类型
  editTypeData(req, res) {
    api.updateData("Type", {
      typeName: req.body.typeName,
    }, { typeId: req.body.typeId }).then(result => {
      res.send({ msg: "成功", code: 700, result })
    }).catch(err => {
      res.send({ msg: "defeat", code: 701 })
    })

  }
  //禁用商品类型
  disableType(req, res) {
    api.updateData("Type", {
      status: 0
    }, {
      typeId: req.body.typeId,
      userId: req.userId
    }).then(result => {
      res.send({ msg: "成功", code: 800, result })
    }).catch(err => {
      res.send({ msg: "defeat", code: 801 })
    })
  }
  //启用商品类型
  enableType(req, res) {
    api.updateData("Type", {
      status: 1
    }, {
      typeId: req.body.typeId,
      userId: req.userId
    }).then(result => {
      res.send({ msg: "启用成功", code: 900, result })
    }).catch(err => {
      res.send({ msg: "defeat", code: 901 })
    })
  }
  // 删除
  removeType(req, res) {
    api.removeData("Type", {
      typeId: req.body.typeId,
      userId: req.userId
    }).then(result => {
      res.send({ msg: "删除类型成功", code: 1000, result })
    }).catch(err => {
      res.send({ msg: "defeat", code: 1001 })
    })
  }

  // 查询数据总数量
  count(req, res) {
    api.count("Type", {
      userId: req.userId
    }).then(result => {
      res.send({ msg: "code 成功", code: 1010, result })
    }).catch(err => {
      res.send({ msg: "defeat", code: 1011 })
    })
  }

  // 查询所有商品类型
  getTypeAll(req, res) {

    api.findData("Type", {
      userId: req.userId,
      status: 1
    }).then(result => {
      res.send({ msg: "成功", code: 600, result })
    }).catch(err => {
      res.send({ msg: "失败", code: 601 })
    })
  }

  // 发布商品
  addProduct(req, res) {
    // data:image/png;base64, 获取base64
    // png image 获取图片类型

    let pimgBase64 = req.body.pimg.replace(/data:image\/[a-z]+;base64,/, '').replace(/ /g, '+');
    let pimgType = req.body.pimg.split(";")[0].split("/")[1];

    let pdimgBase64 = req.body.pdimg.replace(/data:image\/[a-z]+;base64,/, '').replace(/ /g, '+');
    let pdimgType = req.body.pdimg.split(";")[0].split("/")[1];

    // 等待上传完毕所有图片之后 再将商品数据写入数据库
    Promise.all([
      // 任务1 商品图片
      utils.uploadImg({
        base64: pimgBase64,
        type: pimgType
      }),
      // 任务2 详情图片
      utils.uploadImg({
        base64: pdimgBase64,
        type: pdimgType
      })
    ]).then(result => {
      req.body.pimg = config.serverOptions.host + ":" + config.serverOptions.port + "/" + result[0].filename;
      req.body.pdimg = config.serverOptions.host + ":" + config.serverOptions.port + "/" + result[1].filename;

      // 移除多于属性
      delete req.body.token;

      req.body.price = Number(req.body.price);
      req.body.count = Number(req.body.count);
      req.body.status = Number(req.body.status);
      // 生成一个商品Pid属性
      req.body.pid = "_p" + new Date().getTime();

      req.body.userId = req.userId;


      api.createData("Product", req.body).then(result => {
        res.send({ msg: "发布商品成功", code: 1300, result })
      }).catch(err => {
        res.send("发布商品失败")
      })
    }).catch(err => {
      res.send("上传失败")
    })
  }

  searchProduct(req, res) {
    console.log('req.query ==> ', req.query);

    //sql替换内容
    let replacements = {
      userId: req.userId,
      offset: Number(req.query.offset),
      count: Number(req.query.count)
    };

    let sql = "SELECT `p`.`pid`, `p`.`pname`, `p`.`status`, `p`.`updated_at` AS `updatedAt`, `t`.`type_name` AS `typeName` FROM `product` AS `p` INNER JOIN `type` AS `t` ON `p`.`user_id` = :userId AND `p`.`type_id` = `t`.`type_id`";

    /**
     * AND `p` `pname` LIKE '%A%' AND `p`.`type_id` = '_t1599747175461' AND `p`.`status` = 1 AND `p`.`updated_at` >= '2020-09-26 00:00:00' AND `p`.`updated_at` <= '2020-09-26 23:59:50' ORDER BY `p`.`updated_at` DESC LIMIT 0, 2"
     */

    //如果存在搜索商品名称，则需要按照搜索关键字进行模糊查询
    if (req.query.pname) {
      sql += " AND `p`.`pname` LIKE :pname";
      replacements.pname = `%${req.query.pname}%`;
    }

    //如果指定类型查询
    if (req.query.typeId) {
      sql += " AND `p`.`type_id` = :typeId";
      replacements.typeId = req.query.typeId;
    }

    //如果存在商品状态
    if (req.query.status) {
      sql += " AND `p`.`status` = :status";
      replacements.status = Number(req.query.status);
    }

    //如果存在上架日期
    if (req.query.updatedAt) {
      sql += " AND `p`.`updated_at` >= :start AND `p`.`updated_at` <= :end";
      replacements.start = req.query.updatedAt + ' 00:00:00';
      replacements.end = req.query.updatedAt + ' 23:59:59';
    }

    sql += " ORDER BY `p`.`updated_at` DESC LIMIT :offset, :count";

    api.query(sql, replacements).then(result => {
      res.send({ msg: '搜索商品成功', code: 1400, result });
    }).catch(err => {
      console.log('err ==> ', err);
      res.send({ msg: '搜索商品失败', code: 1401 });
    })



  }

  // 上架或者下架
  proStatus(req, res) {
    api.updateData('Product', {
      status: Number(req.body.status)
    }, {
      pid: req.body.pid
    }).then(result => {
      res.send({ msg: '商品状态更改成功', code: 1500, result });
    }).catch(err => {
      console.log('err ==> ', err);
      res.send({ msg: '商品状态更改失败', code: 1501 });
    })
  }

  removePro(req, res) {
    api.removeData("Product", {
      pid: req.body.pid,
    }).then(result => {
      res.send({ msg: "删除类型成功", code: 1600, result })
    }).catch(err => {
      res.send({ msg: "defeat", code: 1601 })
    })
  }

  // 查看商品
  viewProduct(req, res) {
    api.findData("Product", {
      pid: req.query.pid
    }).then(result => {
      res.send({ msg: "查看商品成功", code: 1700, result })
    }).catch(err => {
      res.send({ msg: "defeat", code: 1701 })
    })
  }

  // 编辑商品
  editProduct(req, res) {
    let imgs = [];
    //保存图片类型
    var imgsType = [];
    if (req.body.pimg) {
      imgsType.push('pimg');
      let pimgBase64 = req.body.pimg.replace(/data:image\/[a-z]+;base64,/, '').replace(/ /g, '+');
      let pimgType = req.body.pimg.split(";")[0].split("/")[1];
      imgs.push(utils.uploadImg({
        base64: pimgBase64,
        type: pimgType
      }))
    }
    if (req.body.pdimg) {
      imgsType.push('pdimg');
      let pdimgBase64 = req.body.pdimg.replace(/data:image\/[a-z]+;base64,/, '').replace(/ /g, '+');
      let pdimgType = req.body.pdimg.split(";")[0].split("/")[1];
      imgs.push(utils.uploadImg({
        base64: pdimgBase64,
        type: pdimgType
      }))
    }

    if (imgs.length) {
      // 等待上传完毕所有图片之后 再将商品数据写入数据库
      Promise.all(imgs).then(result => {
        //将商品数据写入数据库中
        imgsType.forEach((v, i) => {
          req.body[v] = config.serverOptions.host + ':' + config.serverOptions.port + '/' + result[i].filename;
        })
        updateProduct(req.body, res);
      }).catch(err => {
        res.send("上传失败")
      })

    } else {
      updateProduct(req.body, res);
    }
  }

  getProductCount(req, res) {

    var condition = Object.assign({}, req.query);

    condition.userId = req.userId;

    //如果存在商品，则需要进行模糊查询
    if (req.query.pname) {
      condition.pname = {
        [Op.like]: `%${req.query.pname}%`
      }
    }

    if (req.query.updatedAt) {
      condition.updatedAt = {
        [Op.and]: {
          [Op.gte]: req.query.updatedAt + ' 00:00:00',
          [Op.lte]: req.query.updatedAt + ' 23:59:59'
        }
      }
    }

    delete condition.token;

    api.count("Product", condition).then(result => {
      res.send({ msg: "code111成功", code: 1090, result })
    }).catch(err => {
      res.send({ msg: "defeat", code: 101 })
    })
  }

  //上传用户头像
  uploadUserImg(req, res) {
    // 获取用户图片
    let base64 = req.body.base64.replace(/data:image\/[a-z]+;base64,/, '').replace(/ /g, '+');
    // 图片类型
    let type = req.body.base64.split(";")[0].split("/")[1];

    utils.uploadImg({
      base64: base64,
      type: type
    }).then(result => {
      let url = config.serverOptions.host + ":" + config.serverOptions.port + "/" + result.filename;
      api.updateData("User", {
        url
      }, {
        userId: req.userId,
      }).then(result1 => {
        res.send({ msg: "上传用户头像成功", code: 1100, result1, url })
      })
    }).catch(err => {
      res.send({ msg: "上传失败" })
    })
  }
  // 修改昵称
  updateNickName(req, res) {
    api.updateData("User", {
      nickname: req.body.nickname
    }, {
      userId: req.userId,
    }).then(result => {
      res.send({ msg: "昵称成功", code: 1200, result })
    }).catch(err => {
      res.send({ msg: "昵称失败" })
    })
  }

  updatePwd(req, res) {
    // 查询用户密码
    api.findData("User", {
      userId: req.userId
    }, ['password']).then(result => {

      if (result.length) {
        if (req.body.oldpwd == result[0].dataValues.password) {
          api.updateData("User", {
            password: req.body.newpwd
          }, {
            userId: req.userId
          }).then(result2 => {
            console.log('result2', result2);
            res.send({ msg: "成功", code: 1104, result2 })
          })
        } else {
          res.send({ msg: "旧密码不正确", code: 1105 })
        }
      }
      // res.send({ msg: "密码" })
    }).catch(err => {
      res.send({ msg: "失败" })
    })
  }

  // 找回密码
  forgot(req, res) {

    api.updateData("User", {
      password: req.body.password
    }, {
      email: req.body.email
    }).then(result => {
      res.send({ msg: "密码找回成功", code: 1107, result })
    }).catch(err => {
      console.log('失败');
    })
  }
}
//导出实例
module.exports = new RoutesController();
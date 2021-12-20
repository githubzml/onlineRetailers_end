let nodemailer = require('nodemailer');

// 导入文件系统模块
let fs = require("fs");

//设置邮箱配置
let transporter = nodemailer.createTransport({
  host: 'smtp.163.com',//邮箱服务的主机，如smtp.qq.com
  port: '465',//对应的端口号  465 25端口在阿里云服务器禁用的
  //开启安全连接 465 / true  
  secure: true,
  //secureConnection:false,
  //用户信息
  auth: {
    // 发件地址
    user: '15712965708@163.com',
    pass: 'TQTGJLAOFHMHNQEC'
  }
});


// 导入jsonwebtoken模块

let jsonwebtoken = require("jsonwebtoken");

class Utils {
  sendEmail(emails, code, fn) {
    //设置收件人信息
    let mailOptions = {
      from: '15712965708@163.com',//谁发的
      to: emails,//发给谁
      subject: '邮箱验证',//主题是什么
      text: `邮箱验证码${code}，5分钟内有效`,//文本内容
      html: '',//html模板

      //附件信息
      // attachments: [
      //   {
      //     filename: '',
      //     path: '',
      //   }
      // ]
    };
    //发送邮件
    transporter.sendMail(mailOptions, fn);
  }

  // 生成token
  signToken(value, expires) {
    // jsonwebtoken

    // expiresIn 过期时间的写法
    // 60 ===> '60s'
    // "100" ===> '100ms'
    // "2 days" ===> '2天'
    // "10h" ===> '10小时'
    // "7d" ===> '7天'

    return jsonwebtoken.sign({ data: value }, config.saltOptions.tokenSalt, {
      expiresIn: expires
    })
    // 加盐 强化加密
    // 过期时间
  }

  // 解析token
  verifyToken(value, fn) {
    // fn (err,decode) 解析失败会有err 解析成功会有一个解析出来的值decode
    jsonwebtoken.verify(value, config.saltOptions.tokenSalt, fn)
  }

  uploadImg(file) {
    // file.type 
    // file.base64
    return new Promise((resolve, reject) => {
      // 将base64 转化为二进制文件
      let buff = Buffer.from(file.base64, "base64");
      // 文件名
      let filename = "_p" + Math.random().toString().slice(2) + "." + file.type;

      fs.writeFile(__basename + "/upload/" + filename, buff, err => {
        if (err) {
          reject({ msg: "上传文件失败", code: 1021 })
        } else {
          resolve({ msg: "上传文件成功", code: 1020, filename })
        }
      })
    })
  }
}

module.exports = new Utils();

// fn = (error, info) => {
//   if (error)
//     return console.log(error);
//   console.log(`Message: ${info.messageId}`);
//   console.log(`sent: ${info.response}`);
// }

// let mailOptions = {
//   from: '15712965708@163.com',//谁发的
//   to: ['1127417900@qq.com', '17319265295@163.com'],//发给谁
//   subject: '邮箱验证',//主题是什么
//   text: `邮箱验证码${code}，5分钟内有效`,//文本内容
//   html: '',//html模板

//   //附件信息
//   attachments: [
//     {
//       filename: '',
//       path: '',
//     }
//   ]
// };
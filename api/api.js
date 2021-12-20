class API {
  // 创建数据
  createData(modelName, o) {
    // modelName 模型 string
    // o 创建数据 object
    return Model[modelName].create(o)
  }
  //查询
  // modelName 模块名
  // condition 条件
  // attributes 属性
  findData(modelName, condition, attributes) {
    return Model[modelName].findAll({ attributes, where: condition })
  }

  // 原始查询
  query(sql, o) {
    return sequelize.query(
      sql,
      {
        replacements: o,
        type: sequelize.QueryTypes.SELECT
      })
  }

  // 更新数据
  updateData(modelName, values, condition) {
    return Model[modelName].update(values, { where: condition })
  }

  // 删除数据
  removeData(modelName, condition) {
    return Model[modelName].destroy({ where: condition })
  }

  count(modelName, condition) {
    return Model[modelName].count({ where: condition })
  }

  //   console.log(`这有 ${await Project.count()} 个项目`);

  // const amount = await Project.count({
  //   where: {
  //     id: {
  //       [Op.gt]: 25
  //     }
  //   }
  // });
  // console.log(`这有 ${amount} 个项目 id 大于 25`);
}

module.exports = new API();
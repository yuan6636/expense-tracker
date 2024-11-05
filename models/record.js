'use strict';
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Record extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Record.belongsTo(models.Category, { foreignKey: 'categoryId' }),
      Record.belongsTo(models.User, { foreignKey: 'userId' })
    }
  }
  Record.init({
    name: DataTypes.STRING,
    date: DataTypes.DATEONLY,
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    categoryId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Record',
    tableName: 'Records',
    underscored: true,
  });
  return Record;
};
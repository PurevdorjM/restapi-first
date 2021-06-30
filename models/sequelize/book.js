const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('book', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    une: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    create_date: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'book',
    timestamps: false,
  });
};

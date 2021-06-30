const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(245),
      allowNull: false
    },
    role: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    password: {
      type: DataTypes.CHAR(10),
      allowNull: false
    },
    about: {
      type: DataTypes.VIRTUAL,
      get(){
        return `${this.name} - ${this.email} (${this.role})`
      }
    }
  }, {
    tableName: 'user',
    timestamps: false,
  });
};

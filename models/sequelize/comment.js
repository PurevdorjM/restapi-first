const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('comment', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'user',
        key: 'id'
      }
    },
    bookId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'book',
        key: 'id'
      }
    },
    comment: {
      type: DataTypes.STRING(450),
      allowNull: false,
      validate: {
        // isEmail: {
        //   msg: 'Заавал имейл оруулна уу 🚀',
        // },
        notContains: {
          args: ['миа'],
          msg: 'Таны комментод системд ашиглахыг хориглосон үг орсон байна 🐰',
        }
        // min: {
        //   args: [20],
        //   msg: 'Хамгийн багадаа 20 тэмдэгт байх ёстой 🐰  ',
        // }
      },
      get(){
        let comment = this.getDataValue('comment').toLowerCase();
        return comment.charAt(0).toUpperCase() + comment.slice(1);
      },
      // set(value){
      //   this.setDataValue('comment', value.replace('миа', 'тиймэрхүү'));
      // }
    }
  }, {
    tableName: 'comment',
    timestamps: true
  });
};

import cls from 'cls-hooked';
import Sequelize from 'sequelize';

Sequelize.useCLS(cls.createNamespace('simple-ppob-namespace'));

const db = new Sequelize(process.env.DB_URL,
  {
    dialect: 'postgres',
    define: {
      underscoredAll: true,
    },
    logging: process.env.NODE_ENV != 'production' ? true : false,
  });

module.exports = {
  db,
};
import cls from 'cls-hooked';
import Sequelize from 'sequelize';

Sequelize.useCLS(cls.createNamespace('simple-ppob-namespace'));

const db = new Sequelize(process.env.DB_URL,
  {
    dialect: 'postgres',
    define: {
      underscoredAll: true,
    },
    dialectOptions: { decimalNumbers: true }
  });

module.exports = {
  db,
};
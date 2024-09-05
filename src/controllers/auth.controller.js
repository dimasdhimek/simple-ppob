import bcrypt from 'bcrypt';
import Joi from 'joi';
import jwt from 'jsonwebtoken';
import response from '../helpers/response.helper';
import { db } from '../models';

const AuthController = {
  async register(req, res, next) {
    try {

      // validate input
      try {
        const schema = Joi.object({
          email: Joi.string().email().required().error(new Error('Parameter email tidak sesuai format')),
          first_name: Joi.string().required().error(new Error('Parameter first_name tidak sesuai format')),
          last_name: Joi.string().optional().allow('').error(new Error('Parameter last_name tidak sesuai format')),
          password: Joi.string().min(8).required().error(new Error('Parameter password tidak sesuai format')),
        });

        await schema.validateAsync(req.body);
      } catch (error) {
        return response({ res, message: error.message, code: 400, status: 102 });
      }

      // hash the password
      const password = await bcrypt.hash(req.body.password, 12);

      await db.transaction(async dbTrx => {
        // create user and balance
        let user = await db.query(`
          insert into users (email, first_name, last_name, password)
          values (:email, :first_name, :last_name, :password)
          returning id
          `,
          {
            replacements: {
              ...req.body,
              password
            }
          });

        user = user[0]?.[0];

        await db.query(`
          insert into balances (user_id)
          values (:user_id)
          `,
          {
            replacements: {
              user_id: user.id
            }
          });

        return response({ res, message: 'Registrasi berhasil silahkan login' });
      });

    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {

      // validate input
      try {
        const schema = Joi.object({
          email: Joi.string().email().required().error(new Error('Parameter email tidak sesuai format')),
          password: Joi.string().min(8).required().error(new Error('Parameter password tidak sesuai format')),
        });

        await schema.validateAsync(req.body);
      } catch (error) {
        return response({ res, message: error.message, code: 400, status: 102 });
      }

      let user = await db.query(`
        select id, email, password
        from users where email = :email
        `,
        {
          replacements: {
            email: req.body.email
          }
        });

      user = user[0]?.[0];

      // validate password
      let passwordValidation = false;
      if (user) {
        passwordValidation = await bcrypt.compare(req.body.password, user.password);
      }

      if (!passwordValidation) {
        return response({ res, message: 'Username atau password salah', code: 401, status: 103 });
      }

      // create jwt token
      const token = jwt.sign({
        id: user.id,
        email: user.email
      }, process.env.JWT_SECRET, {
        expiresIn: '24h'
      });

      return response({ res, message: 'Login sukses', data: { token } });

    } catch (error) {
      next(error);
    }
  }
};

module.exports = AuthController;
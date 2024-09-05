import Joi from 'joi';
import response from '../helpers/response.helper';
import { db } from '../models';

const UserController = {
  async view(req, res, next) {
    try {

      let user = await db.query(`
        select email, first_name, last_name, profile_image
        from users where id = :id
        `,
        {
          replacements: {
            id: req.auth.id
          }
        });

      user = user[0]?.[0];

      if (!user) {
        return response({ res, code: 404 });
      }

      return response({ res, data: user });

    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      // validate input
      try {
        const schema = Joi.object({
          first_name: Joi.string().required().error(new Error('Parameter first_name tidak sesuai format')),
          last_name: Joi.string().optional().allow('').error(new Error('Parameter last_name tidak sesuai format')),
        });

        await schema.validateAsync(req.body);
      } catch (error) {
        return response({ res, message: error.message, code: 400, status: 102 });
      }

      await db.transaction(async dbTrx => {

        let user = await db.query(`
        update users
        set first_name = :first_name,
        last_name = :last_name
        where id = :id
        returning email, first_name, last_name, profile_image
        `,
          {
            replacements: {
              ...req.body,
              id: req.auth.id
            }
          });

        user = user[0]?.[0];

        if (!user) {
          return response({ res, code: 404 });
        }

        return response({ res, message: 'Update Pofile berhasil', data: user });
      });

    } catch (error) {
      next(error);
    }
  },

  async updateImage(req, res, next) {
    try {
      await db.transaction(async dbTrx => {

        let user = await db.query(`
        update users
        set profile_image = :img_url
        where id = :id
        returning email, first_name, last_name, profile_image
        `,
          {
            replacements: {
              id: req.auth.id,
              img_url: process.env.HOST + '/file/profile-image/' + req.file.filename
            }
          });

        user = user[0]?.[0];

        if (!user) {
          return response({ res, code: 404 });
        }

        return response({ res, message: 'Update Pofile Image berhasil', data: user });
      });

    } catch (error) {

      next(error);
    }
  },
};

module.exports = UserController;
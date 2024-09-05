import response from '../helpers/response.helper';
import { db } from '../models';

const BannerController = {
  async list(req, res, next) {
    try {

      const banners = await db.query(`
        select banner_name, banner_image, description
        from banners
        `
      );

      return response({ res, data: banners[0] });

    } catch (error) {
      next(error);
    }
  }
};

module.exports = BannerController;
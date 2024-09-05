import response from '../helpers/response.helper';
import { db } from '../models';

const BannerController = {
  async list(req, res, next) {
    try {

      const services = await db.query(`
        select service_code, service_name, service_icon, service_tariff
        from services
        `
      );

      return response({ res, data: services[0] });

    } catch (error) {
      next(error);
    }
  }
};

module.exports = BannerController;
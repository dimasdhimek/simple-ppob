import response from '../helpers/response.helper';
import { db } from '../models';

const BalanceController = {
  async view(req, res, next) {
    try {

      const balance = await db.query(`
        select amount
        from balances where user_id = :user_id
        `,
        {
          replacements: {
            user_id: req.auth.id
          }
        }
      );

      return response({ res, message: 'Get Balance Berhasil', data: { balance: balance[0]?.[0]?.amount ?? 0 } });

    } catch (error) {
      next(error);
    }
  }
};

module.exports = BalanceController;
import Joi from 'joi';
import { updateBalance } from '../helpers/balance.helper';
import response from '../helpers/response.helper';
import { db } from '../models';

const TransactionController = {
  async list(req, res, next) {
    try {

      let query = `
        select invoice_number, transaction_type, description, total_amount, created_at created_on
        from transactions where user_id = :user_id
        order by created_at desc
      `;

      let replacements = {
        user_id: req.auth.id
      };

      if (req.query.limit >= 0) {
        query += ` limit :limit`;
        replacements.limit = req.query.limit;
      }

      if (req.query.offset >= 0) {
        query += ` offset :offset`;
        replacements.offset = req.query.offset;
      }

      const transactions = await db.query(
        query,
        {
          replacements
        }
      );

      return response({
        res,
        message: 'Get History Berhasil',
        data: {
          offset: parseInt(req.query.offset ?? 0),
          limit: parseInt(req.query.limit ?? 0),
          records: transactions[0]
        }
      });

    } catch (error) {
      next(error);
    }
  },

  async topup(req, res, next) {
    try {
      // validate input
      try {
        const schema = Joi.object({
          top_up_amount: Joi.number().min(0).required().error(new Error('Parameter top_up_amount hanya boleh angka dan tidak boleh lebih kecil dari 0')),
        });

        await schema.validateAsync(req.body);
      } catch (error) {
        return response({ res, message: error.message, code: 400, status: 102 });
      }

      await db.transaction(async dbTrx => {
        // create new transaction
        await db.query(`
        insert into transactions (user_id, balance_id, invoice_number, transaction_type, total_amount, description)
        values (
          :user_id,
          (select id from balances where user_id = :user_id),
          concat(
            'INV',
            to_char(now(), 'DDMMYYYY'),
            '-',
            (
              select lpad((coalesce(count(*), 0) + 1)::text, 4, '0')
              from transactions
              where user_id = :user_id and created_at >= now()::date + interval '1h'
            )
          ),
          'TOPUP',
          :top_up_amount,
          'Top Up balance'
        )
        `,
          {
            replacements: {
              ...req.body,
              user_id: req.auth.id,
            }
          });

        // update balance
        const balance = await updateBalance(req.auth.id);

        return response({ res, message: 'Top Up Balance berhasil', data: { balance } });
      });

    } catch (error) {
      next(error);
    }
  },

  async payment(req, res, next) {
    try {
      let service;

      // validate input
      try {
        const schema = Joi.object({
          service_code: Joi.string().required().error(new Error('Parameter service_code tidak sesuai format')),
        });

        await schema.validateAsync(req.body);

        // validate service
        service = await db.query(`
          select id, service_tariff, service_name, service_code from services where service_code = :service_code
          `,
          {
            replacements: {
              ...req.body
            }
          });

        service = service[0]?.[0];

        if (!service || service?.service_tariff <= 0) {
          throw new Error("Service atau Layanan tidak ditemukan");
        }

      } catch (error) {
        return response({ res, message: error.message, code: 400, status: 102 });
      }

      await db.transaction(async dbTrx => {
        // create new transaction
        let transaction = await db.query(`
        insert into transactions (user_id, balance_id, service_id, invoice_number, transaction_type, total_amount, description)
        values (
          :user_id,
          (select id from balances where user_id = :user_id),
          :service_id,
          concat(
            'INV',
            to_char(now(), 'DDMMYYYY'),
            '-',
            (
              select lpad((coalesce(count(*), 0) + 1)::text, 4, '0')
              from transactions
              where user_id = :user_id and created_at >= now()::date + interval '1h'
            )
          ),
          'PAYMENT',
          :amount,
          :description
        )
        returning invoice_number, transaction_type, total_amount, created_at created_on
        `,
          {
            replacements: {
              ...req.body,
              user_id: req.auth.id,
              service_id: service.id,
              amount: service.service_tariff,
              description: service.service_name,
            }
          });

        transaction = transaction[0]?.[0];

        // update balance
        await updateBalance(req.auth.id);

        return response({
          res, message: 'Transaksi berhasil', data: {
            ...transaction,
            service_code: service.service_code,
            service_name: service.service_name
          }
        });
      });

    } catch (error) {
      next(error);
    }
  }
};

module.exports = TransactionController;
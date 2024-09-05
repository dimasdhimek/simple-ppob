import { db } from '../models';

// helper for update balance table

const BalanceHelper = {
  async updateBalance(userId) {
    let balance = await db.query(`
        update balances
        set amount = (
          select coalesce(sum(case when transaction_type = 'PAYMENT' then -1 * total_amount else total_amount end), 0)
          from transactions where user_id = :user_id
        ),
        updated_at = now()
        where user_id = :user_id returning amount
        `,
      {
        replacements: {
          user_id: userId
        }
      });

    balance = balance[0]?.[0]?.amount ?? 0;

    if (balance < 0) {
      throw new Error("APP::insufficient_balance");
    }

    return balance;
  }
};

module.exports = BalanceHelper;
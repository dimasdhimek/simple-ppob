import { Router } from 'express';
import { list, payment, topup } from '../controllers/transaction.controller';

const routes = Router();

routes.get('/transaction/history', list);
routes.post('/topup', topup);
routes.post('/transaction', payment);

module.exports = routes;
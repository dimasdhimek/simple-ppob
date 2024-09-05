import { Router } from 'express';
import { view } from '../controllers/balance.controller';

const routes = Router();

routes.get('/balance', view);

module.exports = routes;
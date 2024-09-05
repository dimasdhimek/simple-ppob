import { Router } from 'express';
import { list } from '../controllers/service.controller';

const routes = Router();

routes.get('/services', list);

module.exports = routes;
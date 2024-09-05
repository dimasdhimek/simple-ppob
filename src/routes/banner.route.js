import { Router } from 'express';
import { list } from '../controllers/banner.controller';

const routes = Router();

routes.get('/banner', list);

module.exports = routes;
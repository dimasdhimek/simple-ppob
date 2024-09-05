import { Router } from 'express';
import { login, register } from '../controllers/auth.controller';

const routes = Router();

routes.post('/registration', register);
routes.post('/login', login);

module.exports = routes;
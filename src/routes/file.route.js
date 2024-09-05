import { Router } from 'express';
import { getProfileImage } from '../controllers/file.controller';

const routes = Router();

routes.get('/file/profile-image/:fileName', getProfileImage);

module.exports = routes;
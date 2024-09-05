import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { update, updateImage, view } from '../controllers/user.controller';

const uploader = multer({
  storage: multer.diskStorage({
    destination: './uploads/profile_image',
    filename: function (req, file, callback) {
      callback(null, 'user_id:' + req.auth.id + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 2 * 1024 * 1024, // limit file size 2mb
  },
  fileFilter: (req, file, callback) => {
    const filetypes = /jpeg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      callback(null, true);
    } else {
      callback(new Error('APP::invalid_profile_image_type'), false);
    }
  },
}).single('file');


const routes = Router();

routes.get('/profile', view);
routes.put('/profile/update', update);
routes.put('/profile/image', uploader, updateImage
);

module.exports = routes;
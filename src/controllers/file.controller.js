import fs from 'fs';
import path from 'path';
import response from '../helpers/response.helper';

const BannerController = {
  async getProfileImage(req, res, next) {
    try {
      const filePath = path.join(process.cwd(), 'uploads/profile_image', req.params.fileName);
      const isFileExist = fs.existsSync(filePath);

      if (path.parse(req.params.fileName).name.replace('user_id:', '') != req.auth.id || !isFileExist) {
        return response({ res, code: 404 });
      } else {
        return res.sendFile(filePath);
      }
    } catch (error) {
      next(error);
    }
  }
};

module.exports = BannerController;
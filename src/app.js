import compression from 'compression';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import { UnauthorizedError } from 'express-jwt';
import morgan from 'morgan';
import { MulterError } from 'multer';
import { trim_all } from 'request_trimmer';
import { UniqueConstraintError } from 'sequelize';
import logger from './helpers/logger.helper';
import response from './helpers/response.helper';
import auth_middleware from './middlewares/auth_middleware';

const app = express();

app.use(
  cors(),
  compression(),
  express.json(),
  trim_all
);

if (process.env.NODE_ENV != 'production') {
  app.use(morgan('dev'));
}

// public route
app.use(require('./routes/auth.route'));
app.use(require('./routes/banner.route'));

// routes that protected by token
app.use(auth_middleware);
app.use(require('./routes/service.route'));
app.use(require('./routes/user.route'));
app.use(require('./routes/balance.route'));
app.use(require('./routes/transaction.route'));
app.use(require('./routes/file.route'));

// error handler
app.use(function (error, req, res, next) {
  if (error instanceof UnauthorizedError) {
    return response({ res, code: 401 });
  } else if (error instanceof UniqueConstraintError) {
    return response({ res, code: 409 });
  } else if (error.message == 'APP::insufficient_balance') {
    return response({ res, code: 422, status: 102, message: 'Saldo tidak cukup' });
  } else if (error.message == 'APP::invalid_profile_image_type') {
    return response({ res, code: 400, status: 102, message: 'Format Image tidak sesuai' });
  } else if (error instanceof MulterError) {
    return response({ res, code: 400, status: 102, message: error.message });
  }

  logger.error(
    JSON.stringify({
      trace: error.stack,
      user: req.user ?? {},
      body: req.body ?? {},
    }),
  );

  if (process.env.NODE_ENV != 'production') {
    console.log(error);
  }

  return response({ res, code: 500 });
});

app.use(function (req, res, next) {
  return response({ res, code: 404 });
});

app.listen(
  process.env.PORT, () => {
    console.log('Server started on port', process.env.PORT);
  }
);
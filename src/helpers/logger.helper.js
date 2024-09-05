import fs from 'fs';
import { createLogger, format } from 'winston';
import 'winston-daily-rotate-file';
import { DailyRotateFile } from 'winston/lib/winston/transports';

// helper for error logging

const logDir = 'logs';

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`),
  ),
  transports: [
    new DailyRotateFile({
      filename: `${logDir}/%DATE%-results.log`,
      datePattern: 'YYYY-MM-DD'
    }),
  ]
});

module.exports = logger;

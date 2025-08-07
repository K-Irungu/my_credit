import { createLogger, format, transports } from 'winston';

const logger = createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json()
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'logs/app.log', maxsize: 5242880, maxFiles: 5 })
    ],
    exitOnError: false,
});

export default logger;
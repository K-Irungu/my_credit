import { createLogger, format, transports } from "winston";

// Check environment
const isProd = process.env.NODE_ENV === "production";

const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.Console(), 
    ...(isProd
      ? [] 
      : [
          new transports.File({
            filename: "logs/app.log",
            maxsize: 5 * 1024 * 1024, // 5MB
            maxFiles: 5,
          }),
        ]),
  ],
  exitOnError: false,
});


export default logger;

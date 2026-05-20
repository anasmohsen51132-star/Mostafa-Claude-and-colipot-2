import winston from "winston";
import { v4 as uuid } from "uuid";

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

export const requestLogger = (req, res, next) => {
  const correlationId = uuid();
  req.correlationId = correlationId;
  logger.info({ correlationId, method: req.method, url: req.url });
  next();
};

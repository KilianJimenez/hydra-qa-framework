import { createLogger, format, transports, Logger as WinstonLogger } from 'winston';

/**
 * Centralized logger (singleton) for the entire framework.
 */
export class Logger {
  private static instance: WinstonLogger;

  static getInstance(): WinstonLogger {
    if (!Logger.instance) {
      Logger.instance = createLogger({
        level: process.env.LOG_LEVEL || 'info',
        format: format.combine(
          format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          format.printf(({ timestamp, level, message }: { timestamp: string; level: string; message: string }) => {
            return `[${timestamp}] ${level.toUpperCase().padEnd(5)} │ ${message}`;
          }),
        ),
        transports: [
          new transports.Console({
            format: format.combine(format.colorize(), format.simple()),
          }),
          new transports.File({
            filename: 'test-results/test-run.log',
            format: format.uncolorize(),
          }),
        ],
      });
    }
    return Logger.instance;
  }
}


import { Logger as WLogger, createLogger, format, transports } from "winston";

export interface Logger {
  with(fields: Fields): Logger;

  error(message: string, fields?: Fields): void;
  warn(message: string, fields?: Fields): void;
  info(message: string, fields?: Fields): void;
  debug(message: string, fields?: Fields): void;
}

//eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Fields = { [key: string]: any };

class WinstonLogger {
  private logger: WLogger;

  constructor(private fields: Fields = {}) {
    this.logger = createLogger({
      exitOnError: false,
      format: format.json(),
      transports: [new transports.Console()],
    });
  }

  with(fields: Fields): Logger {
    return new WinstonLogger({ ...this.fields, ...fields });
  }

  getFields(additionalFields?: Fields): Fields {
    return { ...this.fields, ...(additionalFields ?? {}) };
  }

  error(message: string, fields?: Fields) {
    this.logger.error(message, this.getFields(fields));
  }

  warn(message: string, fields?: Fields) {
    this.logger.warn(message, this.getFields(fields));
  }

  info(message: string, fields?: Fields) {
    this.logger.info(message, this.getFields(fields));
  }

  debug(message: string, fields?: Fields) {
    this.logger.debug(message, this.getFields(fields));
  }
}

export const defaultLogger: Logger = new WinstonLogger();
export const logger = defaultLogger;

import pino from 'pino';

const isProd = process.env.NODE_ENV === 'production';

export const logger = isProd
  ? pino({ level: 'info' })
  : pino({
      level: 'debug',
      // Casting to any to accommodate pino transport typing with exactOptionalPropertyTypes enabled
      transport: {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:standard' },
      } as any,
    });



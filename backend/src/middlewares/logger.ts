import { createLogger, format, transports } from 'winston';
import * as fs from 'fs';
import * as path from 'path';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const logger = createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
    ),
    defaultMeta: { service: 'employee-management-api' },
    transports: [
        // Write all logs to console
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.printf(({ timestamp, level, message, ...meta }) => {
                    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
                    return `${timestamp} [${level}]: ${message} ${metaStr}`;
                })
            ),
        }),
        // Write errors to file
        new transports.File({ filename: path.join(logsDir, 'error.log'), level: 'error' }),
        // Write all logs to file
        new transports.File({ filename: path.join(logsDir, 'combined.log') }),
    ],
});

export default logger;

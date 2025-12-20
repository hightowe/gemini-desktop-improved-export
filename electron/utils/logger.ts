/**
 * Simple logger utility for the Electron main process.
 * Provides consistent log formatting with prefixes.
 * 
 * @module Logger
 */

import type { Logger } from '../types';

/**
 * Creates a logger instance with a consistent prefix.
 * 
 * @param prefix - The prefix to prepend to all log messages (e.g., '[WindowManager]')
 * @returns Logger object with log, error, and warn methods
 * 
 * @example
 * const logger = createLogger('[MyModule]');
 * logger.log('Hello world'); // [MyModule] Hello world
 * logger.error('Something failed'); // [MyModule] Something failed
 */
export function createLogger(prefix: string): Logger {
    /**
     * Safely writes to console, catching EPIPE errors that occur
     * when stdout/stderr is closed during app reload on Windows.
     */
    const safeWrite = (
        method: 'log' | 'error' | 'warn',
        message: string,
        args: unknown[]
    ): void => {
        try {
            console[method](`${prefix} ${message}`, ...args);
        } catch (e: any) {
            // Ignore EPIPE errors - they occur when stdout/stderr is closed (e.g. detached process)
            // Check for 'code' (Node.js system errors) or message string
            const isEpipe =
                e?.code === 'EPIPE' ||
                (e?.message && typeof e.message === 'string' && e.message.includes('EPIPE'));

            // If it's not an EPIPE error, rethrow. Otherwise, suppress it.
            if (!isEpipe) {
                // Determine if we should really crash on a log error. 
                // For safety, we will just suppress console errors in production to avoid crashes.
                // But following the existing pattern, we only swallow EPIPE.
                // However, let's log to stderr just in case if possible, or just swallow if really needed.
                // The safest fix for the reported issue is to be robust about EPIPE.
                throw e;
            }
        }
    };

    return {
        /**
         * Log an info message.
         * @param message - Message to log
         * @param args - Additional arguments
         */
        log(message: string, ...args: unknown[]): void {
            safeWrite('log', message, args);
        },

        /**
         * Log an error message.
         * @param message - Message to log
         * @param args - Additional arguments
         */
        error(message: string, ...args: unknown[]): void {
            safeWrite('error', message, args);
        },

        /**
         * Log a warning message.
         * @param message - Message to log
         * @param args - Additional arguments
         */
        warn(message: string, ...args: unknown[]): void {
            safeWrite('warn', message, args);
        }
    };
}

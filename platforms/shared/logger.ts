/**
 * Structured logging utility
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  module?: string
  metadata?: Record<string, any>
  error?: {
    name: string
    message: string
    stack?: string
  }
}

class Logger {
  private module?: string

  constructor(module?: string) {
    this.module = module
  }

  private log(level: LogLevel, message: string, metadata?: Record<string, any>, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      module: this.module,
      metadata,
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }
    }

    // In production, send to logging service
    // For now, console output with structured format
    const logMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log
    logMethod(JSON.stringify(entry))
  }

  debug(message: string, metadata?: Record<string, any>) {
    this.log('debug', message, metadata)
  }

  info(message: string, metadata?: Record<string, any>) {
    this.log('info', message, metadata)
  }

  warn(message: string, metadata?: Record<string, any>) {
    this.log('warn', message, metadata)
  }

  error(message: string, error?: Error, metadata?: Record<string, any>) {
    this.log('error', message, metadata, error)
  }
}

export function createLogger(module?: string): Logger {
  return new Logger(module)
}

export const logger = createLogger()




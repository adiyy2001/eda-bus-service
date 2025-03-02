import { Injectable, Inject, InjectionToken } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoggingMiddleware implements EventMiddleware {
  constructor(@Inject(LOGGING_CONFIG) private config: LoggingConfig) {}

  handle(eventType: string, payload: any, direction: 'emit' | 'receive' | 'unsubscribe' | 'subscribe' | 'schedule' | 'throttled', level: 'INFO' | 'DEBUG' | 'ERROR' = 'INFO'): void {
    // Skip logging if disabled or log level is not allowed
    if (!this.config.enableLogging || !this.config.logLevels.includes(level)) {
      return;
    }

    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] [${direction.toUpperCase()}] Event Type: ${eventType}`;
    const logPayload = `[${timestamp}] Payload: ${JSON.stringify(payload)}`;

    // Output logs based on configuration
    if (this.config.output === 'console' || this.config.output === 'both') {
      console.log(logMessage);
      console.log(logPayload);
    }

    if (this.config.output === 'server' || this.config.output === 'both') {
      this.sendToServer(logMessage, logPayload);
    }
  }

  private sendToServer(message: string, payload: string): void {
    if (!this.config.serverUrl) {
      console.error('Server logging is enabled, but no server URL is configured.');
      return;
    }

    // Simulate an HTTP request to the logging server
    fetch(this.config.serverUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, payload }),
    }).catch((error) => console.error('Failed to log to server:', error));
  }
}

export interface EventMiddleware {
  handle(eventType: string, payload: any, direction: 'emit' | 'receive'): void;

}

export interface LoggingConfig {
  enableLogging: boolean; // Whether logging is enabled
  logLevels: ('INFO' | 'DEBUG' | 'ERROR')[]; // Allowed log levels
  output: 'console' | 'server' | 'both'; // Where to log the messages
  serverUrl?: string; // Optional server URL for remote logging
}



// Default logging configuration
export const DEFAULT_LOGGING_CONFIG: LoggingConfig = {
  enableLogging: true,
  logLevels: ['INFO', 'ERROR', 'DEBUG'],
  output: 'console',
};

export const LOGGING_CONFIG = new InjectionToken<LoggingConfig>('LOGGING_CONFIG', {
  providedIn: 'root',
  factory: () => DEFAULT_LOGGING_CONFIG,
});

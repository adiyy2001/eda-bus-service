import { NgModule } from '@angular/core';
import { EventBusService } from './services/event-bus.service';
import { ErrorHandlerMiddleware } from './middleware/error-handler.middleware';
import { LoggingMiddleware, LOGGING_CONFIG, LoggingConfig } from './middleware/logging.middleware';
import { ValidationMiddleware } from './middleware/validation.middleware';

const defaultLoggingConfig: LoggingConfig = {
  enableLogging: true,
  logLevels: ['INFO', 'DEBUG', 'ERROR'],
  output: 'console',
};

@NgModule({
  providers: [
    EventBusService,
    ErrorHandlerMiddleware,
    ValidationMiddleware,
    { provide: LOGGING_CONFIG, useValue: defaultLoggingConfig },
    LoggingMiddleware,
  ],
})
export class EventBusModule {}

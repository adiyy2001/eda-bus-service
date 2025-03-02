// File path: src/lib/middleware/error-handler.middleware.ts

import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerMiddleware implements ErrorHandlingMiddleware {
  // A method to handle errors globally
  handleError(eventType: string, error: Error, direction: 'emit' | 'receive'): void {
    const timestamp = new Date().toISOString();
    const errorDetails = {
      timestamp,
      eventType,
      direction: direction.toUpperCase(),
      message: error.message,
      stack: error.stack,
    };

    // Log the error details in a structured format
    console.error(`[ERROR]:`, JSON.stringify(errorDetails, null, 2));

    // Additional behavior: Notify a central service or trigger a recovery mechanism
    this.notifyErrorService(errorDetails);
  }

  // A method to notify a central error service for advanced monitoring
  private notifyErrorService(errorDetails: Record<string, any>): void {
    // This could be an HTTP service call to a monitoring system
    // Replace the console log with the actual implementation
    console.log(`Notifying central error service:`, errorDetails);
  }
}

export interface ErrorHandlingMiddleware {
  handleError(eventType: string, error: Error, direction: 'emit' | 'receive'): void;
}

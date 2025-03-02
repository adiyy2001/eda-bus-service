import { ErrorHandlerMiddleware } from "../../middleware/error-handler.middleware";

describe('ErrorHandlerMiddleware', () => {
  let errorHandlerMiddleware: ErrorHandlerMiddleware;

  beforeEach(() => {
    errorHandlerMiddleware = new ErrorHandlerMiddleware();
  });

  it('should log error details when handleError is called', () => {
    const consoleErrorSpy = spyOn(console, 'error');
    const eventType = 'TestEvent';
    const error = new Error('Test error');
    const direction = 'emit';

    errorHandlerMiddleware.handleError(eventType, error, direction);

    // Extract the second argument from console.error call
    const loggedErrorString = consoleErrorSpy.calls.mostRecent().args[1];
    const loggedErrorObject = JSON.parse(loggedErrorString); // Parse the JSON string

    // Assert the important parts of the logged error
    expect(loggedErrorObject).toEqual(
      jasmine.objectContaining({
        eventType: 'TestEvent',
        direction: 'EMIT',
        message: 'Test error',
      })
    );

    // Check for the presence of specific properties
    expect(loggedErrorObject.timestamp).toBeDefined();
    expect(loggedErrorObject.stack).toBeDefined();
  });

  it('should call notifyErrorService with error details', () => {
    const notifySpy = spyOn<any>(errorHandlerMiddleware, 'notifyErrorService');
    const eventType = 'TestEvent';
    const error = new Error('Test error');
    const direction = 'emit';

    errorHandlerMiddleware.handleError(eventType, error, direction);

    expect(notifySpy).toHaveBeenCalledWith(
      jasmine.objectContaining({
        eventType: 'TestEvent',
        direction: 'EMIT',
        message: 'Test error',
      })
    );
  });

  it('should log a message when notifying the central error service', () => {
    const consoleLogSpy = spyOn(console, 'log');
    const eventType = 'TestEvent';
    const errorDetails = {
      timestamp: new Date().toISOString(),
      eventType,
      direction: 'EMIT',
      message: 'Test error',
    };

    // Directly test the private method
    (errorHandlerMiddleware as any).notifyErrorService(errorDetails);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      'Notifying central error service:',
      jasmine.objectContaining({
        eventType: 'TestEvent',
        direction: 'EMIT',
        message: 'Test error',
      })
    );
  });
});

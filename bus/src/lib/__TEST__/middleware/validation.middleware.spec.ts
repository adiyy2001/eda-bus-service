import { ValidationMiddleware } from "../../middleware/validation.middleware";

describe('ValidationMiddleware', () => {
  let validationMiddleware: ValidationMiddleware;

  beforeEach(() => {
    validationMiddleware = new ValidationMiddleware();
  });

  it('should allow events without a registered schema', () => {
    const eventType = 'UnregisteredEvent';
    const payload = { data: 'test' };
    const result = validationMiddleware.validate(eventType, payload);
    expect(result).toBeTrue();
  });

  it('should validate events with a valid payload', () => {
    const eventType = 'TestEvent';
    const schema = {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
      },
      required: ['id', 'name'],
    };
    validationMiddleware.addSchema(eventType, schema);

    const payload = { id: '123', name: 'Test' };
    const result = validationMiddleware.validate(eventType, payload);

    expect(result).toBeTrue();
  });

  it('should reject events with an invalid payload', () => {
    const eventType = 'TestEvent';
    const schema = {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
      },
      required: ['id', 'name'],
    };
    validationMiddleware.addSchema(eventType, schema);

    const payload = { id: '123' }; // Missing `name`
    const result = validationMiddleware.validate(eventType, payload);

    expect(result).toBeFalse();
  });

  it('should log a warning if no schema is registered for an event type', () => {
    const consoleWarnSpy = spyOn(console, 'warn');
    const eventType = 'UnregisteredEvent';
    const payload = { data: 'test' };

    validationMiddleware.validate(eventType, payload);

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      `[ValidationMiddleware] No schema registered for event type: ${eventType}`
    );
  });

  it('should log an error for invalid payloads', () => {
    const consoleErrorSpy = spyOn(console, 'error');
    const eventType = 'TestEvent';
    const schema = {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
      },
      required: ['id', 'name'],
    };
    validationMiddleware.addSchema(eventType, schema);

    const payload = { id: '123' }; // Missing `name`
    validationMiddleware.validate(eventType, payload);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `[ValidationMiddleware] Validation failed for event: ${eventType}`,
      jasmine.any(Array)
    );
  });
});

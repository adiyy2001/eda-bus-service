import { TestBed } from '@angular/core/testing';
import { LoggingMiddleware, LoggingConfig, LOGGING_CONFIG } from '../../middleware/logging.middleware';

describe('LoggingMiddleware', () => {
  let loggingMiddleware: LoggingMiddleware;
  let config: LoggingConfig;

  beforeEach(() => {
    // Mock configuration for testing
    config = {
      enableLogging: true,
      logLevels: ['INFO', 'DEBUG', 'ERROR'],
      output: 'console',
    };

    TestBed.configureTestingModule({
      providers: [
        LoggingMiddleware,
        { provide: LOGGING_CONFIG, useValue: config },
      ],
    });

    loggingMiddleware = TestBed.inject(LoggingMiddleware);
  });

  it('should not log if logging is disabled', () => {
    config.enableLogging = false;
    spyOn(console, 'log');

    loggingMiddleware.handle('testEvent', { data: 'test' }, 'emit', 'INFO');

    expect(console.log).not.toHaveBeenCalled();
  });

  it('should not log if log level is not allowed', () => {
    config.logLevels = ['ERROR']; // Only log errors
    spyOn(console, 'log');

    loggingMiddleware.handle('testEvent', { data: 'test' }, 'emit', 'DEBUG');

    expect(console.log).not.toHaveBeenCalled();
  });

  it('should log to the console for valid configuration', () => {
    spyOn(console, 'log');

    loggingMiddleware.handle('testEvent', { data: 'test' }, 'emit', 'INFO');

    expect(console.log).toHaveBeenCalledWith(jasmine.stringMatching(/\[INFO\] \[EMIT\] Event Type: testEvent/));
    expect(console.log).toHaveBeenCalledWith(jasmine.stringMatching(/Payload: {"data":"test"}/));
  });

  it('should log to the server if output is set to server', (done) => {
    config.output = 'server';
    config.serverUrl = 'http://mock-server.com/log';

    spyOn(window, 'fetch').and.callFake((url, options) => {
      expect(url).toBe('http://mock-server.com/log');
      expect(options?.method).toBe('POST');
      expect(options?.headers).toEqual({ 'Content-Type': 'application/json' });
      expect(options?.body).toContain('testEvent');
      done();
      return Promise.resolve(new Response());
    });

    loggingMiddleware.handle('testEvent', { data: 'test' }, 'emit', 'INFO');
  });

  it('should log to both console and server if output is set to both', (done) => {
    config.output = 'both';
    config.serverUrl = 'http://mock-server.com/log';

    spyOn(console, 'log');
    spyOn(window, 'fetch').and.callFake((url, options) => {
      expect(url).toBe('http://mock-server.com/log');
      expect(options?.method).toBe('POST');
      done();
      return Promise.resolve(new Response());
    });

    loggingMiddleware.handle('testEvent', { data: 'test' }, 'emit', 'INFO');

    expect(console.log).toHaveBeenCalledWith(jasmine.stringMatching(/\[INFO\] \[EMIT\] Event Type: testEvent/));
  });

  it('should log an error if server logging is enabled but no URL is configured', () => {
    config.output = 'server';
    config.serverUrl = undefined;

    spyOn(console, 'error');

    loggingMiddleware.handle('testEvent', { data: 'test' }, 'emit', 'INFO');

    expect(console.error).toHaveBeenCalledWith('Server logging is enabled, but no server URL is configured.');
  });
});

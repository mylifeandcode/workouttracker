import { TestBed } from '@angular/core/testing';
import { ErrorHandler, provideZonelessChangeDetection } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { type Mocked } from 'vitest';

import { GlobalErrorHandler } from './global-error-handler';
import { NotificationService } from './_services/notification/notification.service';
import { ReportedErrorRegistry } from './_services/error-reporting/reported-error-registry.service';

describe('GlobalErrorHandler', () => {

  let errorHandler: ErrorHandler;
  let notificationService: NotificationService;
  let reportedErrors: ReportedErrorRegistry;

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const NotificationServiceMock: Partial<Mocked<NotificationService>> = {
      error: vi.fn<NotificationService['error']>()
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: ErrorHandler, useClass: GlobalErrorHandler },
        { provide: NotificationService, useValue: NotificationServiceMock }
      ]
    });

    errorHandler = TestBed.inject(ErrorHandler);
    notificationService = TestBed.inject(NotificationService);
    reportedErrors = TestBed.inject(ReportedErrorRegistry);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should notify the user about an unexpected error', () => {
    errorHandler.handleError(new TypeError('x is not a function'));

    expect(notificationService.error).toHaveBeenCalledTimes(1);
    expect(vi.mocked(notificationService.error).mock.calls[0][0]).toBe('Something went wrong');
  });

  it('should log every error it handles', () => {
    const error = new TypeError('x is not a function');

    errorHandler.handleError(error);

    //provideBrowserGlobalErrorListeners() calls preventDefault(), so we must log it ourselves.
    expect(console.error).toHaveBeenCalledWith('[Unhandled error]', error);
  });

  it('should not notify twice about an error already reported elsewhere', () => {
    const error = new TypeError('already handled');
    reportedErrors.markReported(error);

    errorHandler.handleError(error);

    expect(notificationService.error).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  /*
  GlobalHttpErrorInterceptor owns every HTTP failure: it either reported this one, or
  the caller passed selfHandled() and owns the presentation. Notifying here would
  duplicate the first case and override the second.
  */
  it('should leave HTTP failures to GlobalHttpErrorInterceptor', () => {
    errorHandler.handleError(new HttpErrorResponse({ status: 500 }));

    expect(notificationService.error).not.toHaveBeenCalled();
  });

  it('should leave a self-handled HTTP failure alone even though it was never marked reported', () => {
    const error = new HttpErrorResponse({ status: 401 });

    expect(reportedErrors.wasReported(error)).toBe(false);

    errorHandler.handleError(error);

    expect(notificationService.error).not.toHaveBeenCalled();
  });

  it('should handle a thrown string without throwing', () => {
    expect(() => errorHandler.handleError('something broke')).not.toThrow();

    expect(notificationService.error).toHaveBeenCalledTimes(1);
  });

  it('should handle null and undefined without throwing', () => {
    expect(() => errorHandler.handleError(null)).not.toThrow();
    expect(() => errorHandler.handleError(undefined)).not.toThrow();
  });
});

import { HttpClient, HttpErrorResponse, HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, TestRequest, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Provider, provideZonelessChangeDetection } from '@angular/core';
import { BehaviorSubject, Subject, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { type Mocked } from 'vitest';

import { GlobalHttpErrorInterceptor } from './global-http-error.interceptor';
import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from './_services/auth/auth.service';
import { ConfigService } from './_services/config/config.service';
import { NotificationService } from './_services/notification/notification.service';
import { ReportedErrorRegistry } from './_services/error-reporting/reported-error-registry.service';
import { selfHandled } from './_http/http-error-context';

describe('GlobalHttpErrorInterceptor', () => {

  const API_URL = '/api/things';

  let httpTestingController: HttpTestingController;
  let httpClient: HttpClient;
  let notificationService: NotificationService;

  function buildNotificationServiceMock(): Partial<Mocked<NotificationService>> {
    return { error: vi.fn<NotificationService['error']>() };
  }

  function buildConfigServiceMock(apiRoot: string | null = '/api/'): Partial<Mocked<ConfigService>> {
    return { get: vi.fn<ConfigService['get']>().mockReturnValue(apiRoot) };
  }

  function configure(extraProviders: Provider[]): void {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ...extraProviders,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    notificationService = TestBed.inject(NotificationService);
  }

  beforeEach(() => {
    //The interceptor logs every failure; keep it out of the test output.
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('on its own', () => {

    beforeEach(() => {
      configure([
        { provide: HTTP_INTERCEPTORS, useClass: GlobalHttpErrorInterceptor, multi: true },
        { provide: NotificationService, useValue: buildNotificationServiceMock() },
        { provide: ConfigService, useValue: buildConfigServiceMock() }
      ]);
    });

    it('should notify the user about a server error', () => {
      httpClient.get(API_URL).subscribe({ error: () => undefined });

      httpTestingController.expectOne(API_URL).flush('boom', { status: 500, statusText: 'Server Error' });

      expect(notificationService.error).toHaveBeenCalledTimes(1);
      expect(vi.mocked(notificationService.error).mock.calls[0][1]).toContain("couldn't load");
    });

    it('should make a server error sticky', () => {
      httpClient.get(API_URL).subscribe({ error: () => undefined });

      httpTestingController.expectOne(API_URL).flush('boom', { status: 500, statusText: 'Server Error' });

      expect(vi.mocked(notificationService.error).mock.calls[0][2]).toEqual({ sticky: true });
    });

    it('should make a client error transient', () => {
      httpClient.get(API_URL).subscribe({ error: () => undefined });

      httpTestingController.expectOne(API_URL).flush('nope', { status: 404, statusText: 'Not Found' });

      expect(vi.mocked(notificationService.error).mock.calls[0][2]).toEqual({ sticky: false });
    });

    it('should log the failure so it is available for telemetry', () => {
      httpClient.get(API_URL).subscribe({ error: () => undefined });

      httpTestingController.expectOne(API_URL).flush('boom', { status: 500, statusText: 'Server Error' });

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[HTTP 500] GET /api/things'),
        expect.anything(), expect.anything(), expect.anything());
    });

    it('should not notify about a successful response', () => {
      httpClient.get(API_URL).subscribe();

      httpTestingController.expectOne(API_URL).flush({ ok: true });

      expect(notificationService.error).not.toHaveBeenCalled();
    });

    describe('must never swallow the error', () => {

      it('should still deliver the original HttpErrorResponse to the subscriber', () => {
        let caught: unknown;

        httpClient.get(API_URL).subscribe({ error: (error: unknown) => { caught = error; } });

        httpTestingController.expectOne(API_URL).flush('boom', { status: 500, statusText: 'Server Error' });

        expect(caught).toBeInstanceOf(HttpErrorResponse);
        expect((caught as HttpErrorResponse).status).toBe(500);
      });

      it('should let a downstream catchError substitute its fallback value', () => {
        let received: string | undefined;

        httpClient.get<string>(API_URL)
          .pipe(catchError(() => of('fallback')))
          .subscribe((value: string) => { received = value; });

        httpTestingController.expectOne(API_URL).flush('boom', { status: 500, statusText: 'Server Error' });

        expect(received).toBe('fallback');
        expect(notificationService.error).toHaveBeenCalledTimes(1);
      });

      /*
      tap forwards a throw from its error callback DOWNSTREAM in place of the original
      error, so a bug in the mapper or in ng-zorro must not reach the application.
      */
      it('should deliver the original error even if reporting itself throws', () => {
        vi.mocked(notificationService.error).mockImplementation(() => { throw new Error('ng-zorro exploded'); });
        let caught: unknown;

        httpClient.get(API_URL).subscribe({ error: (error: unknown) => { caught = error; } });

        httpTestingController.expectOne(API_URL).flush('boom', { status: 500, statusText: 'Server Error' });

        expect(caught).toBeInstanceOf(HttpErrorResponse);
        expect((caught as HttpErrorResponse).status).toBe(500);
      });
    });

    describe('opt-out', () => {

      it('should not notify when the caller marked the request self-handled', () => {
        let caught: unknown;

        httpClient.get(API_URL, selfHandled()).subscribe({ error: (error: unknown) => { caught = error; } });

        httpTestingController.expectOne(API_URL).flush('boom', { status: 500, statusText: 'Server Error' });

        expect(notificationService.error).not.toHaveBeenCalled();
        //The caller still gets the error — it owns the presentation, not the outcome.
        expect(caught).toBeInstanceOf(HttpErrorResponse);
      });
    });

    it('should mark the error as reported so GlobalErrorHandler does not repeat it', () => {
      const registry = TestBed.inject(ReportedErrorRegistry);
      let caught: unknown;

      httpClient.get(API_URL).subscribe({ error: (error: unknown) => { caught = error; } });

      httpTestingController.expectOne(API_URL).flush('boom', { status: 500, statusText: 'Server Error' });

      expect(registry.wasReported(caught)).toBe(true);
    });
  });

  describe('scoping to our own API', () => {

    it('should ignore requests outside apiRoot, such as the config.json fetch', () => {
      configure([
        { provide: HTTP_INTERCEPTORS, useClass: GlobalHttpErrorInterceptor, multi: true },
        { provide: NotificationService, useValue: buildNotificationServiceMock() },
        { provide: ConfigService, useValue: buildConfigServiceMock() }
      ]);

      httpClient.get('config.json').subscribe({ error: () => undefined });

      httpTestingController.expectOne('config.json').flush('boom', { status: 500, statusText: 'Server Error' });

      expect(notificationService.error).not.toHaveBeenCalled();
    });

    /*
    ConfigService.get() returns null until the app initializer has run. Reporting
    before then would try to render a notification with no host in place.
    */
    it('should stay quiet while config has not been loaded yet', () => {
      configure([
        { provide: HTTP_INTERCEPTORS, useClass: GlobalHttpErrorInterceptor, multi: true },
        { provide: NotificationService, useValue: buildNotificationServiceMock() },
        { provide: ConfigService, useValue: buildConfigServiceMock(null) }
      ]);

      httpClient.get(API_URL).subscribe({ error: () => undefined });

      httpTestingController.expectOne(API_URL).flush('boom', { status: 500, statusText: 'Server Error' });

      expect(notificationService.error).not.toHaveBeenCalled();
    });
  });

  /*
  THE ORDERING GUARANTEE.

  Angular builds the interceptor chain with reduceRight, so the FIRST HTTP_INTERCEPTORS
  entry is the outermost. GlobalHttpErrorInterceptor has to wrap AuthInterceptor, or a
  silent token refresh stops being silent. These tests assert BOTH orders, so the
  "correct order" test can't pass for the wrong reason.
  */
  describe('ordering relative to AuthInterceptor', () => {

    let authService: AuthService;

    function buildAuthServiceMock(): Partial<Mocked<AuthService>> {
      return {
        token: 'someAccessToken',
        isRefreshing: false,
        refreshTokenSubject: new BehaviorSubject<string | null>(null),
        refreshFailed$: new Subject<void>(),
        refreshAccessToken: vi.fn<AuthService['refreshAccessToken']>().mockReturnValue(of(true)),
        logOut: vi.fn<AuthService['logOut']>()
      };
    }

    function configureWithBothInterceptors(errorInterceptorFirst: boolean): void {
      const errorInterceptor: Provider = { provide: HTTP_INTERCEPTORS, useClass: GlobalHttpErrorInterceptor, multi: true };
      const authInterceptor: Provider = { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true };

      configure([
        ...(errorInterceptorFirst ? [errorInterceptor, authInterceptor] : [authInterceptor, errorInterceptor]),
        { provide: AuthService, useValue: buildAuthServiceMock() },
        { provide: NotificationService, useValue: buildNotificationServiceMock() },
        { provide: ConfigService, useValue: buildConfigServiceMock() }
      ]);

      authService = TestBed.inject(AuthService);
    }

    it('should NOT notify the user when a silent token refresh succeeds', () => {
      configureWithBothInterceptors(true);
      let received: unknown;

      httpClient.get(API_URL).subscribe((value: unknown) => { received = value; });

      httpTestingController.expectOne(API_URL).flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
      httpTestingController.expectOne(API_URL).flush({ ok: true });

      expect(authService.refreshAccessToken).toHaveBeenCalled();
      expect(received).toEqual({ ok: true });
      expect(notificationService.error).not.toHaveBeenCalled();
    });

    /*
    Proves the test above detects the mistake it exists to prevent, rather than
    passing for some unrelated reason.
    */
    it('should notify spuriously if the interceptors are registered in the wrong order', () => {
      configureWithBothInterceptors(false);

      httpClient.get(API_URL).subscribe();

      httpTestingController.expectOne(API_URL).flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
      httpTestingController.expectOne(API_URL).flush({ ok: true });

      expect(notificationService.error).toHaveBeenCalled();
    });

    it('should notify once when the refresh fails', () => {
      configureWithBothInterceptors(true);
      vi.mocked(authService.refreshAccessToken).mockReturnValue(of(false));

      httpClient.get(API_URL).subscribe({ error: () => undefined });

      httpTestingController.expectOne(API_URL).flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      expect(authService.logOut).toHaveBeenCalled();
      expect(notificationService.error).toHaveBeenCalledTimes(1);
      expect(vi.mocked(notificationService.error).mock.calls[0][1]).toBe('Your session has expired. Please sign in again.');
    });

    it('should still report a replayed request that fails for a different reason', () => {
      configureWithBothInterceptors(true);

      httpClient.get(API_URL).subscribe({ error: () => undefined });

      httpTestingController.expectOne(API_URL).flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
      const replay: TestRequest = httpTestingController.expectOne(API_URL);
      replay.flush('boom', { status: 500, statusText: 'Server Error' });

      expect(notificationService.error).toHaveBeenCalledTimes(1);
      expect(vi.mocked(notificationService.error).mock.calls[0][1]).toContain("couldn't load");
    });
  });
});

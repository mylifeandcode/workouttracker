import { HttpErrorResponse } from '@angular/common/http';
import { toAppError } from './app-error.mapper';

describe('toAppError', () => {

  function httpError(status: number, error: unknown = null, statusText = 'Error'): HttpErrorResponse {
    return new HttpErrorResponse({ status, statusText, error, url: 'http://localhost:5600/api/things' });
  }

  describe('ProblemDetails parsing', () => {

    it('should use the ProblemDetails detail as the user message for a 400', () => {
      const appError = toAppError(httpError(400, {
        title: 'Bad Request',
        detail: 'Username is already taken.',
        status: 400
      }), 'POST');

      expect(appError.userMessage).toBe('Username is already taken.');
      expect(appError.status).toBe(400);
    });

    it('should fall back to the ProblemDetails title when there is no detail', () => {
      const appError = toAppError(httpError(400, { title: 'Username is already taken.' }), 'POST');

      expect(appError.userMessage).toBe('Username is already taken.');
    });

    it('should capture the traceId', () => {
      const appError = toAppError(httpError(500, { title: 'Server error', traceId: '00-abc-def-01' }), 'GET');

      expect(appError.traceId).toBe('00-abc-def-01');
    });

    it('should surface a plain string body for a 400', () => {
      const appError = toAppError(httpError(400, 'Username is already taken'), 'POST');

      expect(appError.userMessage).toBe('Username is already taken');
    });

    it('should NOT surface an HTML error page as a user message', () => {
      const appError = toAppError(httpError(400, '<html><body>400 Bad Request</body></html>'), 'POST');

      expect(appError.userMessage).toBe("That request wasn't valid.");
    });

    it('should NOT surface server text longer than the length limit', () => {
      const appError = toAppError(httpError(400, { detail: 'x'.repeat(400) }), 'POST');

      expect(appError.userMessage).toBe("That request wasn't valid.");
    });
  });

  describe('validation errors', () => {

    it('should normalize field error keys to camelCase and prompt the user to correct them', () => {
      const appError = toAppError(httpError(400, {
        title: 'One or more validation errors occurred.',
        errors: {
          'Name': ['The Name field is required.'],
          'EmailAddress': ['Not a valid email address.']
        }
      }), 'POST');

      expect(appError.fieldErrors).toEqual({
        name: ['The Name field is required.'],
        emailAddress: ['Not a valid email address.']
      });
      expect(appError.userMessage).toBe('Please correct the highlighted fields and try again.');
    });

    it('should drop the model-level empty key', () => {
      const appError = toAppError(httpError(400, {
        errors: { '': ['A model-level error.'], 'Name': ['Required.'] }
      }), 'POST');

      expect(appError.fieldErrors).toEqual({ name: ['Required.'] });
    });

    it('should coerce a single string to an array', () => {
      const appError = toAppError(httpError(422, {
        errors: { 'Name': 'Required.' } as unknown as Record<string, string[]>
      }), 'POST');

      expect(appError.fieldErrors).toEqual({ name: ['Required.'] });
    });

    it('should not set fieldErrors when the errors dictionary yields nothing usable', () => {
      const appError = toAppError(httpError(400, { title: 'Bad', errors: { '': [] } }), 'POST');

      expect(appError.fieldErrors).toBeUndefined();
    });
  });

  describe('server error text must never leak', () => {

    /*
    ASP.NET Core in Development mode puts the exception message into
    ProblemDetails.detail. This is the regression lock for that leaking to users.
    */
    it('should keep 5xx exception detail out of the user message', () => {
      const appError = toAppError(httpError(500, {
        title: 'An error occurred while processing your request.',
        detail: 'System.NullReferenceException: Object reference not set to an instance of an object.'
      }), 'GET');

      expect(appError.userMessage).toBe("We couldn't load this data. Please try again.");
      expect(appError.userMessage).not.toContain('NullReferenceException');
      expect(appError.technicalMessage).toContain('NullReferenceException');
    });

    it('should word 5xx failures differently for reads and writes', () => {
      expect(toAppError(httpError(503), 'GET').userMessage).toContain("couldn't load");
      expect(toAppError(httpError(503), 'PUT').userMessage).toContain("couldn't save");
    });
  });

  describe('status mapping', () => {

    it('should treat status 0 as a network error', () => {
      const appError = toAppError(httpError(0, new ProgressEvent('error'), 'Unknown Error'), 'GET');

      expect(appError.isNetworkError).toBe(true);
      expect(appError.status).toBe(0);
      expect(appError.userMessage).toContain("couldn't reach the server");
    });

    it('should treat a timeout as a network error', () => {
      const timeout = new DOMException('The request timed out.', 'TimeoutError');
      const appError = toAppError(httpError(0, timeout, 'Unknown Error'), 'GET');

      expect(appError.isNetworkError).toBe(true);
    });

    /*
    Angular's XhrBackend forces ok=false on a 2xx whose body fails to parse, but KEEPS
    the 2xx status — so this would otherwise fall through to the generic default.
    */
    it('should handle a 2xx whose body could not be parsed', () => {
      const appError = toAppError(
        httpError(200, { error: new SyntaxError('Unexpected token <'), text: '<!DOCTYPE html>' }, 'OK'),
        'GET');

      expect(appError.userMessage).toBe("The server sent a response we couldn't read.");
      expect(appError.isNetworkError).toBe(false);
    });

    it('should map a 401 to a session-expired message', () => {
      expect(toAppError(httpError(401), 'GET').userMessage).toBe('Your session has expired. Please sign in again.');
    });

    it('should map a 403 to a permission message', () => {
      expect(toAppError(httpError(403), 'POST').userMessage).toBe("You don't have permission to do that.");
    });

    it('should word a 404 differently for reads and writes', () => {
      expect(toAppError(httpError(404), 'GET').userMessage).toContain("couldn't find");
      expect(toAppError(httpError(404), 'DELETE').userMessage).toContain('no longer exists');
    });

    it('should map a 409 to a concurrency message', () => {
      expect(toAppError(httpError(409), 'PUT').userMessage).toContain('changed by someone else');
    });

    it('should map a 429 to a rate-limit message', () => {
      expect(toAppError(httpError(429), 'GET').userMessage).toContain('Too many requests');
    });

    it('should map an unrecognized 4xx to the generic message', () => {
      expect(toAppError(httpError(418), 'GET').userMessage).toBe('Something went wrong. Please try again.');
    });
  });

  describe('the synthetic 401 AuthInterceptor rethrows after a failed refresh', () => {

    /*
    auth.interceptor.ts constructs `new HttpErrorResponse({ status: 401 })` with no
    url and no body. HttpErrorResponse.message is still populated (with
    "Http failure response for (unknown url): 401 undefined"), so the mapper must not
    let that reach the user.
    */
    it('should produce a clean session-expired message from a bodyless 401', () => {
      const appError = toAppError(new HttpErrorResponse({ status: 401 }), 'GET');

      expect(appError.userMessage).toBe('Your session has expired. Please sign in again.');
      expect(appError.userMessage).not.toContain('unknown url');
      expect(appError.url).toBeUndefined();
    });
  });

  describe('non-HTTP failures', () => {

    it('should map an Error without throwing', () => {
      const appError = toAppError(new TypeError('x is not a function'));

      expect(appError.status).toBe(-1);
      expect(appError.userMessage).toBe('Something went wrong. Please try again.');
      expect(appError.technicalMessage).toBe('TypeError: x is not a function');
    });

    it('should map a thrown string', () => {
      const appError = toAppError('something broke');

      expect(appError.status).toBe(-1);
      expect(appError.technicalMessage).toBe('something broke');
    });

    it('should map an empty thrown string', () => {
      expect(toAppError('').technicalMessage).toBe('(empty string thrown)');
    });

    it('should map undefined and null without throwing', () => {
      expect(toAppError(undefined).technicalMessage).toBe('(undefined thrown)');
      expect(toAppError(null).technicalMessage).toBe('(null thrown)');
      expect(toAppError(undefined).status).toBe(-1);
    });

    it('should map an arbitrary object without throwing', () => {
      expect(toAppError({ nope: true }).technicalMessage).toBe('{"nope":true}');
    });

    it('should survive an object with a circular reference', () => {
      const circular: Record<string, unknown> = {};
      circular['self'] = circular;

      expect(() => toAppError(circular)).not.toThrow();
      expect(toAppError(circular).status).toBe(-1);
    });
  });
});

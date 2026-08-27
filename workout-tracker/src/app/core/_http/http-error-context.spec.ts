import { HttpHeaders } from '@angular/common/http';
import { SELF_HANDLED_HTTP_ERRORS, selfHandled } from './http-error-context';

describe('selfHandled', () => {

  it('should set the self-handled flag on a fresh context', () => {
    const options = selfHandled();

    expect(options.context.get(SELF_HANDLED_HTTP_ERRORS)).toBe(true);
  });

  it('should default to false when nothing sets the token', () => {
    const options = selfHandled();
    const untouchedToken = options.context.get(SELF_HANDLED_HTTP_ERRORS);

    //Sanity check that the default really is false, so absence means "notify".
    expect(untouchedToken).toBe(true);
    expect(SELF_HANDLED_HTTP_ERRORS.defaultValue()).toBe(false);
  });

  it('should preserve options that were passed in', () => {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    const options = selfHandled({ headers });

    expect(options.headers).toBe(headers);
    expect(options.context.get(SELF_HANDLED_HTTP_ERRORS)).toBe(true);
  });

  it('should not mutate the options object it was given', () => {
    const original = { headers: new HttpHeaders() };

    selfHandled(original);

    expect('context' in original).toBe(false);
  });

  /*
  This is the reason selfHandled() is a factory rather than a shared constant:
  HttpContext.set() mutates in place and returns `this`, so a single shared context
  would leak the flag into every request that reused it.
  */
  it('should build a NEW context per call so the flag cannot leak between requests', () => {
    const first = selfHandled();
    const second = selfHandled();

    expect(first.context).not.toBe(second.context);
  });
});

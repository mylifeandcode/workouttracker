import { HttpContext, HttpContextToken } from '@angular/common/http';

/**
 * When set, GlobalHttpErrorInterceptor will not notify the user about a failure on
 * this request. The CALLER takes full responsibility for surfacing the error.
 *
 * This has to travel with the request rather than being inferred from a downstream
 * catchError, because the interceptor's error operator sits upstream of every
 * operator a service or component can append — by the time their catchError runs,
 * the notification has already been shown. See GlobalHttpErrorInterceptor's header
 * comment for the full pipeline.
 */
export const SELF_HANDLED_HTTP_ERRORS = new HttpContextToken<boolean>(() => false);

/**
 * Returns a NEW options object marking the request as self-handled, preserving
 * whatever options were passed in.
 *
 * This is a factory rather than a shared constant on purpose: HttpContext.set()
 * mutates in place and returns `this`, so a module-level HttpContext would leak the
 * flag into every request that reused it.
 *
 * @example
 * this._http.post<Thing>(url, body, selfHandled(HTTP_OPTIONS))
 */
/*
The no-argument overload is not redundant: without it, T infers as bare `object`, and
HttpClient's overloads then can't tell that `observe` is absent — so post()/get() pick
the Observable<HttpEvent<T>> signature instead of the Observable<T> one.
*/
export function selfHandled(): { context: HttpContext };
export function selfHandled<T extends object>(options: T): T & { context: HttpContext };
export function selfHandled<T extends object>(options?: T): T & { context: HttpContext } {
  return {
    ...(options ?? ({} as T)),
    context: new HttpContext().set(SELF_HANDLED_HTTP_ERRORS, true)
  };
}

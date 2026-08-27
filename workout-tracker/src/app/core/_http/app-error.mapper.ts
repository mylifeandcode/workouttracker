import { HttpErrorResponse } from '@angular/common/http';
import { AppError, FieldErrors } from './app-error';
import { ProblemDetails, isProblemDetails } from './problem-details';

const GENERIC_MESSAGE = "Something went wrong. Please try again.";
const OFFLINE_MESSAGE = "We couldn't reach the server. Check your connection and try again.";

/** Server-supplied text longer than this is a log entry, not a user message. */
const MAX_SERVER_TEXT_LENGTH = 300;

/**
 * Normalizes anything thrown by an HTTP call into a presentation-ready AppError.
 *
 * A pure function with no dependency on Angular's injector, so it can be unit-tested
 * without TestBed and reused anywhere (interceptor, inline error banners, forms).
 *
 * Guarantees: never throws, and never puts server internals into userMessage.
 *
 * @param method The request's HTTP method. A failed GET and a failed PUT warrant
 *               different wording ("couldn't load" vs "couldn't save").
 */
export function toAppError(error: unknown, method: string = 'GET'): AppError {
  if (error instanceof HttpErrorResponse) return fromHttpError(error, method);

  // Not an HTTP failure at all. status -1 distinguishes this from status 0, which
  // means "an HTTP request that never got a response".
  if (error instanceof Error) {
    return nonHttpError(`${error.name}: ${error.message}`);
  }

  if (typeof error === 'string') {
    return nonHttpError(error.length > 0 ? error : '(empty string thrown)');
  }

  return nonHttpError(safeStringify(error));
}

function nonHttpError(technicalMessage: string): AppError {
  return { status: -1, userMessage: GENERIC_MESSAGE, technicalMessage, isNetworkError: false };
}

function fromHttpError(error: HttpErrorResponse, method: string): AppError {
  const problem = isProblemDetails(error.error) ? error.error : undefined;
  const fieldErrors = normalizeFieldErrors(problem?.errors);

  const base = {
    status: error.status,
    technicalMessage: buildTechnicalMessage(error),
    isNetworkError: false,
    url: error.url ?? undefined,
    traceId: typeof problem?.traceId === 'string' ? problem.traceId : undefined,
    ...(fieldErrors ? { fieldErrors } : {})
  };

  /*
  Status 0 means no response arrived: network down, CORS, DNS, or a timeout. Angular's
  XhrBackend puts a ProgressEvent (or a TimeoutError DOMException) in error.error here,
  not a response body.
  */
  if (error.status === 0) {
    return { ...base, isNetworkError: true, userMessage: OFFLINE_MESSAGE };
  }

  /*
  A 2xx whose body failed to parse. XhrBackend forces ok=false but KEEPS the 2xx
  status, so this must be handled before any >= 400 reasoning or it falls through to
  the generic default with a misleading status.
  */
  if (error.status >= 200 && error.status < 300) {
    return { ...base, userMessage: "The server sent a response we couldn't read." };
  }

  switch (error.status) {
    case 400:
    case 422:
      return {
        ...base,
        userMessage: fieldErrors
          ? "Please correct the highlighted fields and try again."
          : safeServerText(error, problem) ?? "That request wasn't valid."
      };

    case 401:
      return { ...base, userMessage: "Your session has expired. Please sign in again." };

    case 403:
      return { ...base, userMessage: "You don't have permission to do that." };

    case 404:
      return {
        ...base,
        userMessage: isReadRequest(method)
          ? "We couldn't find what you were looking for."
          : "That item no longer exists. It may have been deleted by someone else."
      };

    case 409:
      return {
        ...base,
        userMessage: safeServerText(error, problem)
          ?? "This was changed by someone else while you were working. Reload and try again."
      };

    case 429:
      return { ...base, userMessage: "Too many requests. Please wait a moment and try again." };

    default:
      if (error.status >= 500) {
        /*
        NEVER echo server text on a 5xx. ASP.NET Core in Development mode puts the
        exception message — and sometimes stack detail — into ProblemDetails.detail.
        */
        return {
          ...base,
          userMessage: isReadRequest(method)
            ? "We couldn't load this data. Please try again."
            : "We couldn't save your changes. Please try again."
        };
      }

      return { ...base, userMessage: GENERIC_MESSAGE };
  }
}

function isReadRequest(method: string): boolean {
  const upper = method.toUpperCase();
  return upper === 'GET' || upper === 'HEAD';
}

/**
 * The server's own description of the failure, but only when it's safe to show:
 * short, non-empty, and not an HTML error page from IIS or a reverse proxy.
 *
 * Callers must only use this for 4xx. See the 5xx branch above.
 */
function safeServerText(error: HttpErrorResponse, problem: ProblemDetails | undefined): string | undefined {
  const candidate = problem
    ? (problem.detail ?? problem.title)
    : (typeof error.error === 'string' ? error.error : undefined);

  if (typeof candidate !== 'string') return undefined;

  const trimmed = candidate.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_SERVER_TEXT_LENGTH) return undefined;
  if (trimmed.startsWith('<')) return undefined; //An HTML error page is not a user message

  return trimmed;
}

/**
 * ASP.NET Core uses PascalCase model property names, and a "" key for model-level
 * errors. Lower-camel the keys to match our DTOs, drop the empty key, and tolerate a
 * single string where the contract says string[].
 */
function normalizeFieldErrors(errors: Record<string, string[]> | undefined): FieldErrors | undefined {
  if (!errors || typeof errors !== 'object') return undefined;

  const normalized: Record<string, readonly string[]> = {};

  for (const [key, value] of Object.entries(errors)) {
    if (!key) continue;

    const messages = Array.isArray(value)
      ? value.filter((m): m is string => typeof m === 'string' && m.length > 0)
      : (typeof value === 'string' ? [value] : []);

    if (messages.length === 0) continue;

    normalized[key.charAt(0).toLowerCase() + key.slice(1)] = messages;
  }

  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

function buildTechnicalMessage(error: HttpErrorResponse): string {
  const parts: string[] = [error.message];

  if (typeof error.error === 'string' && error.error.length > 0) {
    parts.push(error.error);
  }
  else if (isProblemDetails(error.error)) {
    const problem = error.error;
    if (problem.title) parts.push(problem.title);
    if (problem.detail) parts.push(problem.detail);
  }

  return parts.join(' | ');
}

function safeStringify(value: unknown): string {
  if (value === undefined) return '(undefined thrown)';
  if (value === null) return '(null thrown)';

  try {
    return JSON.stringify(value) ?? String(value);
  }
  catch {
    //Circular reference, or a getter that throws
    return String(value);
  }
}

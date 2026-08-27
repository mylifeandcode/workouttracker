/**
 * Validation messages keyed by form field name. Keys are lower-camelCased so they
 * line up with our DTO property names rather than the server's PascalCase.
 */
export type FieldErrors = Readonly<Record<string, readonly string[]>>;

/**
 * A normalized, presentation-ready view of any failure. Produced by toAppError().
 */
export interface AppError {
  /**
   * The HTTP status, with two sentinels:
   *   0  — the request never got a response (network down, CORS, DNS, timeout).
   *  -1  — not an HTTP failure at all (a thrown Error, string, etc.).
   */
  readonly status: number;

  /** Safe to render to an end user. Never contains server internals. */
  readonly userMessage: string;

  /** For the console and future telemetry only. May contain raw server text. */
  readonly technicalMessage: string;

  /** From ASP.NET Core's ValidationProblemDetails.errors, if present. */
  readonly fieldErrors?: FieldErrors;

  readonly isNetworkError: boolean;

  /** ProblemDetails traceId — the handle for finding this in the backend logs. */
  readonly traceId?: string;

  readonly url?: string;
}

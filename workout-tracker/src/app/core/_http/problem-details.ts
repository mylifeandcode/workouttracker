/**
 * ASP.NET Core's ProblemDetails / ValidationProblemDetails, as they arrive over the
 * wire. The backend emits these for most failures (see the API's Program.cs).
 */
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  /** ASP.NET Core puts this in extensions, but it serializes flat. */
  traceId?: string;
  /** Present only on ValidationProblemDetails. */
  errors?: Record<string, string[]>;
  [extension: string]: unknown;
}

export function isProblemDetails(value: unknown): value is ProblemDetails {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;

  /*
  A failed request's error body can be a ProgressEvent (network/CORS failure) rather
  than a parsed response. Those carry a `type` property too, so the property sniff
  below would match one. Rule out DOM objects explicitly.
  */
  if (value instanceof Event || value instanceof Error) return false;

  return 'title' in value || 'detail' in value || 'errors' in value || 'type' in value;
}

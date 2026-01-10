/**
 * Custom error types for better error handling and user messaging
 */

export type ErrorCode =
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'RATE_LIMIT_ERROR'
  | 'API_ERROR'
  | 'OFFLINE_ERROR'
  | 'PARSE_ERROR'
  | 'CACHE_ERROR'
  | 'UNKNOWN_ERROR';

export interface ErrorDetails {
  code: ErrorCode;
  message: string;
  userMessage: string;
  retryable: boolean;
  retryAfterMs?: number;
}

/**
 * Base error class for PlanScope errors
 */
export class PlanScopeError extends Error {
  public readonly code: ErrorCode;
  public readonly userMessage: string;
  public readonly retryable: boolean;
  public readonly retryAfterMs?: number;

  constructor(details: ErrorDetails) {
    super(details.message);
    this.name = 'PlanScopeError';
    this.code = details.code;
    this.userMessage = details.userMessage;
    this.retryable = details.retryable;
    this.retryAfterMs = details.retryAfterMs;
  }
}

/**
 * Network connectivity error
 */
export class NetworkError extends PlanScopeError {
  constructor(originalError?: Error) {
    super({
      code: 'NETWORK_ERROR',
      message: originalError?.message || 'Network request failed',
      userMessage: 'Unable to connect to the server. Please check your internet connection.',
      retryable: true,
    });
    this.name = 'NetworkError';
  }
}

/**
 * Request timeout error
 */
export class TimeoutError extends PlanScopeError {
  constructor(timeoutMs: number) {
    super({
      code: 'TIMEOUT_ERROR',
      message: `Request timed out after ${timeoutMs}ms`,
      userMessage: 'The request took too long. The server might be busy - please try again.',
      retryable: true,
    });
    this.name = 'TimeoutError';
  }
}

/**
 * Rate limit error (429)
 */
export class RateLimitError extends PlanScopeError {
  constructor(retryAfterMs?: number) {
    super({
      code: 'RATE_LIMIT_ERROR',
      message: 'Rate limit exceeded',
      userMessage: retryAfterMs
        ? `Too many requests. Please wait ${Math.ceil(retryAfterMs / 1000)} seconds.`
        : 'Too many requests. Please wait a moment and try again.',
      retryable: true,
      retryAfterMs: retryAfterMs || 60000, // Default to 60 seconds
    });
    this.name = 'RateLimitError';
  }
}

/**
 * API error (non-2xx response)
 */
export class ApiError extends PlanScopeError {
  public readonly statusCode: number;

  constructor(statusCode: number, statusText?: string) {
    const isServerError = statusCode >= 500;
    super({
      code: 'API_ERROR',
      message: `API returned ${statusCode}: ${statusText || 'Unknown error'}`,
      userMessage: isServerError
        ? 'The planning data service is temporarily unavailable. Please try again later.'
        : 'Unable to fetch planning data. The request was invalid.',
      retryable: isServerError,
    });
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

/**
 * Offline error
 */
export class OfflineError extends PlanScopeError {
  constructor() {
    super({
      code: 'OFFLINE_ERROR',
      message: 'Browser is offline',
      userMessage: 'You appear to be offline. Showing cached data if available.',
      retryable: true,
    });
    this.name = 'OfflineError';
  }
}

/**
 * JSON parse error
 */
export class ParseError extends PlanScopeError {
  constructor(originalError?: Error, context?: string) {
    super({
      code: 'PARSE_ERROR',
      message: originalError?.message || 'Failed to parse response',
      userMessage: context || 'Received invalid data from the server. Please try again.',
      retryable: true,
    });
    this.name = 'ParseError';
  }
}

/**
 * Convert unknown error to PlanScopeError
 */
export function toPlanScopeError(error: unknown): PlanScopeError {
  if (error instanceof PlanScopeError) {
    return error;
  }

  if (error instanceof Error) {
    // Check for specific error types
    if (error.name === 'AbortError') {
      return new TimeoutError(10000);
    }

    if (error.message.includes('fetch') || error.message.includes('network')) {
      return new NetworkError(error);
    }

    if (error instanceof SyntaxError) {
      return new ParseError(error);
    }

    return new PlanScopeError({
      code: 'UNKNOWN_ERROR',
      message: error.message,
      userMessage: 'An unexpected error occurred. Please try again.',
      retryable: true,
    });
  }

  return new PlanScopeError({
    code: 'UNKNOWN_ERROR',
    message: String(error),
    userMessage: 'An unexpected error occurred. Please try again.',
    retryable: true,
  });
}

/**
 * Check if browser is online
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

/**
 * Get user-friendly error message
 */
export function getUserErrorMessage(error: unknown): string {
  const planScopeError = toPlanScopeError(error);
  return planScopeError.userMessage;
}

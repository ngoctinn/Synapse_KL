import type { ApiError } from "./client";
import { ERROR_CODES } from "./config";

export function createApiError(
  status: number,
  message: string,
  details?: unknown
): ApiError {
  return {
    status,
    code: getErrorCode(status),
    message,
    details,
  };
}

export function getErrorCode(status: number): string {
  switch (status) {
    case 400:
      return ERROR_CODES.VALIDATION_ERROR;
    case 401:
      return ERROR_CODES.UNAUTHORIZED;
    case 403:
      return ERROR_CODES.FORBIDDEN;
    case 404:
      return ERROR_CODES.NOT_FOUND;
    case 409:
      return ERROR_CODES.CONFLICT;
    case 408:
      return ERROR_CODES.TIMEOUT;
    case 500:
      return ERROR_CODES.UNKNOWN;
    default:
      return ERROR_CODES.UNKNOWN;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    "code" in error &&
    "message" in error
  );
}

export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown error occurred";
}

export interface ActionErrorResponse {
  success: false;
  message: string;
  error?: ApiError;
}

export interface ActionSuccessResponse<T = void> {
  success: true;
  message?: string;
  data?: T;
}

export type ActionResponse<T = void> =
  | ActionSuccessResponse<T>
  | ActionErrorResponse;

export function createSuccessResponse<T>(
  message?: string,
  data?: T
): ActionSuccessResponse<T> {
  return {
    success: true,
    message,
    data,
  };
}

export function createErrorResponse(
  message: string,
  error?: ApiError
): ActionErrorResponse {
  return {
    success: false,
    message,
    error,
  };
}

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export { apiClient, type ApiError, type ApiResponse } from "./client";
export { ERROR_CODES } from "./config";
export {
  createApiError,
  createErrorResponse,
  createSuccessResponse,
  getErrorCode,
  getErrorMessage,
  isApiError,
  type ActionErrorResponse,
  type ActionResponse,
  type ActionSuccessResponse
} from "./errors";


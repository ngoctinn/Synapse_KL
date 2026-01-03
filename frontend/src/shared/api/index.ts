export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export { apiClient, type ApiResponse, type ApiError } from "./client";
export { API_ENDPOINTS, CACHE_STRATEGIES, ERROR_CODES } from "./config";
export {
  createApiError,
  getErrorCode,
  isApiError,
  getErrorMessage,
  createSuccessResponse,
  createErrorResponse,
  type ActionResponse,
  type ActionErrorResponse,
  type ActionSuccessResponse,
} from "./errors";

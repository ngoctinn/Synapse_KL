"use server";

export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  status: number;
  code: string;
  message: string;
  details?: unknown;
}

export class ApiClient {
  private baseUrl: string;
  private timeout = 30000;
  // Tránh duplicate requests gửi đồng thời đến cùng endpoint
  private pendingRequests = new Map<string, Promise<ApiResponse<unknown>>>();

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const key = this.getRequestKey(endpoint, options);

    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key) as Promise<ApiResponse<T>>;
    }

    const promise = this.executeRequest<T>(endpoint, options).finally(() =>
      this.pendingRequests.delete(key)
    );

    this.pendingRequests.set(key, promise as Promise<ApiResponse<unknown>>);
    return promise;
  }

  private async executeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeout);

    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const error = await this.parseError(res);
        return { success: false, error };
      }

      if (res.status === 204) {
        return { success: true };
      }

      const data = await res.json();
      return { success: true, data };
    } catch (error) {
      clearTimeout(timeout);
      return this.handleError(error) as ApiResponse<T>;
    }
  }

  private async parseError(res: Response): Promise<ApiError> {
    try {
      const data = await res.json();
      return {
        status: res.status,
        code: data.code || "UNKNOWN",
        message: data.message || data.detail || res.statusText,
        details: data,
      };
    } catch {
      return {
        status: res.status,
        code: "PARSE_ERROR",
        message: res.statusText,
      };
    }
  }

  private handleError(error: unknown): ApiResponse {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return {
          success: false,
          error: {
            status: 408,
            code: "TIMEOUT",
            message: "Request timeout after 30 seconds",
          },
        };
      }
      return {
        success: false,
        error: {
          status: 500,
          code: "NETWORK_ERROR",
          message: error.message || "Network error",
        },
      };
    }
    return {
      success: false,
      error: {
        status: 500,
        code: "UNKNOWN",
        message: "Unknown error occurred",
      },
    };
  }

  private getAuthHeaders(): Record<string, string> {
    // Auth chưa được implement - đang chờ module authentication hoàn thành
    return {};
  }

  private getRequestKey(endpoint: string, options: RequestInit): string {
    const method = options.method || "GET";
    return `${method}:${endpoint}`;
  }
}

export const apiClient = new ApiClient(
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
);

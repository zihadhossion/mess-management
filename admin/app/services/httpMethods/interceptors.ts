import type {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

interface RetryConfig extends InternalAxiosRequestConfig {
  _isRetry?: boolean;
}

export function setupInterceptors(
  instance: AxiosInstance,
  onLogout: () => void,
) {
  instance.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error),
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryConfig;

      const isRefreshEndpoint = originalRequest.url?.includes("/auth/refresh");
      if (
        error.response?.status === 401 &&
        !originalRequest._isRetry &&
        !isRefreshEndpoint
      ) {
        originalRequest._isRetry = true;
        try {
          await instance.post("/auth/refresh");
          return instance(originalRequest);
        } catch {
          onLogout();
          return Promise.reject(error);
        }
      }

      return Promise.reject(error);
    },
  );
}

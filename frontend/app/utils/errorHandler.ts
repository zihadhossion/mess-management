import type { AxiosError } from "axios";

export function getErrorMessage(err: unknown): string {
  const axiosErr = err as AxiosError<{ message?: string }>;
  if (axiosErr?.response?.data?.message) {
    return axiosErr.response.data.message;
  }
  if (axiosErr?.message) return axiosErr.message;
  return "An unexpected error occurred";
}

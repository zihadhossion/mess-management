import httpService from "~/services/httpService";

export async function patch<T>(url: string, data?: unknown): Promise<T> {
  const response = await httpService.patch<T>(url, data);
  return response.data;
}

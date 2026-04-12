import httpService from "~/services/httpService";

export async function post<T>(url: string, data?: unknown): Promise<T> {
  const response = await httpService.post<T>(url, data);
  return response.data;
}

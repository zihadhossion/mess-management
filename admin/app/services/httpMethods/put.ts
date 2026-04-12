import httpService from "~/services/httpService";

export async function put<T>(url: string, data?: unknown): Promise<T> {
  const response = await httpService.put<T>(url, data);
  return response.data;
}

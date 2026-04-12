import httpService from "~/services/httpService";

export async function get<T>(
  url: string,
  params?: Record<string, unknown>,
): Promise<T> {
  const response = await httpService.get<T>(url, { params });
  return response.data;
}

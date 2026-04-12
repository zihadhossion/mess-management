import httpService from "~/services/httpService";

export async function del<T>(url: string): Promise<T> {
  const response = await httpService.delete<T>(url);
  return response.data;
}

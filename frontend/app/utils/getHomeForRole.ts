import { Role } from "~/enums/role.enum";

export function getHomeForRole(role: Role): string {
  if (role === Role.MANAGER) return "/manager/dashboard";
  return "/member/dashboard";
}

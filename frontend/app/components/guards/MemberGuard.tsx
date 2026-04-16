import { Navigate, Outlet } from "react-router";
import { useAuth } from "~/hooks/useAuth";
import { Role } from "~/enums/role.enum";

export default function MemberGuard() {
  const { user } = useAuth();
  if (!user?.messId) return <Navigate to="/onboarding/role-selection" replace />;
  if (user.role === Role.MANAGER) return <Navigate to="/manager/dashboard" replace />;
  return <Outlet />;
}

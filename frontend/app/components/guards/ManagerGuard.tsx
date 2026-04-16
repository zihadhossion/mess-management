import { Navigate, Outlet } from "react-router";
import { useAuth } from "~/hooks/useAuth";
import { Role } from "~/enums/role.enum";

export default function ManagerGuard() {
  const { user } = useAuth();
  if (!user?.messId) return <Navigate to="/onboarding/role-selection" replace />;
  if (user.role === Role.MEMBER) return <Navigate to="/member/dashboard" replace />;
  return <Outlet />;
}

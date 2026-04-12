import { Navigate, Outlet } from "react-router";
import { useAuth } from "~/hooks/useAuth";
import { Role } from "~/enums/role.enum";

function getHomeForRole(role: Role): string {
  if (role === Role.MANAGER) return "/manager/dashboard";
  return "/member/dashboard";
}

export default function GuestGuard() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5ECD5]">
        <div className="w-8 h-8 border-4 border-[#626F47] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <Navigate to={getHomeForRole(user.role)} replace />;
  }

  return <Outlet />;
}

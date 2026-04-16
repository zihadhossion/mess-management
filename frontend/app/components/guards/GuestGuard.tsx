import { Navigate, Outlet } from "react-router";
import { useAuth } from "~/hooks/useAuth";
import { getHomeForRole } from "~/utils/getHomeForRole";

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
    if (!user.isEmailVerified) return <Navigate to="/resend-verification" replace />;
    if (user.messId) return <Navigate to={getHomeForRole(user.role)} replace />;
    return <Navigate to="/onboarding/role-selection" replace />;
  }

  return <Outlet />;
}

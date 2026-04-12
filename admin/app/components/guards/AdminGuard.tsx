import { Navigate, Outlet } from "react-router";
import { useAuth } from "~/hooks/useAuth";
import { Role } from "~/enums/role.enum";

export default function AdminGuard() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#626F47]">
        <div className="w-8 h-8 border-4 border-[#F0BB78] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== Role.ADMIN) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

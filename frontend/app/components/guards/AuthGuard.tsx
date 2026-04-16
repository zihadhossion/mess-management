import { Navigate, Outlet } from "react-router";
import { useAuth } from "~/hooks/useAuth";

export default function AuthGuard() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5ECD5]">
        <div className="w-8 h-8 border-4 border-[#626F47] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (!user?.isEmailVerified)
    return <Navigate to="/resend-verification" replace />;

  return <Outlet />;
}

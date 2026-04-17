import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "~/hooks/useAuth";
import { getHomeForRole } from "~/utils/getHomeForRole";

export default function OnboardingGuard() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Outlet />;

  if (user.messId) return <Navigate to={getHomeForRole(user.role)} replace />;

  if (
    user.onboardingStatus === "pending" &&
    location.pathname !== "/onboarding/mess-creation-pending"
  ) {
    return <Navigate to="/onboarding/mess-creation-pending" replace />;
  }

  if (
    user.onboardingStatus === "rejected" &&
    location.pathname !== "/onboarding/mess-creation-rejected"
  ) {
    return <Navigate to="/onboarding/mess-creation-rejected" replace />;
  }

  return <Outlet />;
}

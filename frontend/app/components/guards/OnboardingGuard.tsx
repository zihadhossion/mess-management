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
    location.pathname !== "/onboarding/pending"
  ) {
    return <Navigate to="/onboarding/pending" replace />;
  }

  if (
    user.onboardingStatus === "rejected" &&
    location.pathname !== "/onboarding/rejected"
  ) {
    return <Navigate to="/onboarding/rejected" replace />;
  }

  return <Outlet />;
}

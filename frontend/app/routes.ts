import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";
import memberRoutes from "./routes/member.route";
import managerRoutes from "./routes/manager.route";
import authRoutes from "./routes/auth.route";
import onboardingRoutes from "./routes/onboarding.route";

export default [
  index("pages/splash.tsx"),
  layout("components/guards/GuestGuard.tsx", authRoutes),
  layout("components/guards/AuthGuard.tsx", onboardingRoutes),
  layout("components/layouts/MemberLayout.tsx", memberRoutes),
  layout("components/layouts/ManagerLayout.tsx", managerRoutes),
  route("*", "pages/not-found.tsx"),
] satisfies RouteConfig;

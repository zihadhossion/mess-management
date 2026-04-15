import { route } from "@react-router/dev/routes";

const onboardingRoutes = [
  route("join-mess", "pages/onboarding/join-mess.tsx"),
  route("mess-creation", "pages/onboarding/mess-creation.tsx"),
  route("mess-creation-pending", "pages/onboarding/mess-creation-pending.tsx"),
  route("mess-creation-rejected", "pages/onboarding/mess-creation-rejected.tsx"),
];

export default onboardingRoutes;

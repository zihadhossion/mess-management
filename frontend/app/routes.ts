import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  // Public/auth routes
  index("pages/splash.tsx"),
  route("role-selection", "pages/role-selection.tsx"),

  // Auth routes (guest only)
  layout("components/guards/GuestGuard.tsx", [
    route("login", "pages/auth/login.tsx"),
    route("signup", "pages/auth/signup.tsx"),
    route("forgot-password", "pages/auth/forgot-password.tsx"),
    route("reset-password", "pages/auth/reset-password.tsx"),
    route("verify-email", "pages/auth/verify-email.tsx"),
    route("resend-verification", "pages/auth/resend-verification.tsx"),
  ]),

  // Mess onboarding (requires auth, no mess yet)
  layout("components/guards/AuthGuard.tsx", [
    route("join-mess", "pages/join-mess.tsx"),
    route("mess-creation", "pages/mess-creation.tsx"),
    route("mess-creation-pending", "pages/mess-creation-pending.tsx"),
    route("mess-creation-rejected", "pages/mess-creation-rejected.tsx"),
  ]),

  // Member routes
  layout("components/layouts/MemberLayout.tsx", [
    route("member/dashboard", "pages/member/dashboard.tsx"),
    route("member/menu", "pages/member/menu.tsx"),
    route("member/meal-bills", "pages/member/meal-bills/index.tsx"),
    route("member/meal-bills/:id", "pages/member/meal-bills/detail.tsx"),
    route("member/shared-bills", "pages/member/shared-bills/index.tsx"),
    route("member/shared-bills/:id", "pages/member/shared-bills/detail.tsx"),
    route("member/feedback", "pages/member/feedback.tsx"),
    route("member/notifications", "pages/member/notifications.tsx"),
    route("member/settings", "pages/member/settings.tsx"),
    route("member/item-allocations", "pages/member/item-allocations.tsx"),
  ]),

  // Manager routes
  layout("components/layouts/ManagerLayout.tsx", [
    route("manager/dashboard", "pages/manager/dashboard.tsx"),
    route("manager/menu", "pages/manager/menu.tsx"),
    route("manager/members", "pages/manager/members/index.tsx"),
    route(
      "manager/members/join-requests",
      "pages/manager/members/join-requests.tsx",
    ),
    route("manager/meal-billing", "pages/manager/meal-billing/index.tsx"),
    route(
      "manager/meal-billing/daily-costs",
      "pages/manager/meal-billing/daily-costs.tsx",
    ),
    route(
      "manager/meal-billing/fixed-charges",
      "pages/manager/meal-billing/fixed-charges.tsx",
    ),
    route(
      "manager/meal-billing/item-types",
      "pages/manager/meal-billing/item-types.tsx",
    ),
    route(
      "manager/meal-billing/finalize",
      "pages/manager/meal-billing/finalize.tsx",
    ),
    route(
      "manager/meal-billing/history",
      "pages/manager/meal-billing/history.tsx",
    ),
    route("manager/shared-bills", "pages/manager/shared-bills/index.tsx"),
    route(
      "manager/shared-bills/history",
      "pages/manager/shared-bills/history.tsx",
    ),
    route("manager/settings", "pages/manager/settings.tsx"),
    route("manager/settings/lifecycle", "pages/manager/settings/lifecycle.tsx"),
  ]),

  // 404 catch-all
  route("*", "pages/not-found.tsx"),
] satisfies RouteConfig;

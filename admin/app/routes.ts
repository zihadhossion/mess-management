import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  // Public: admin login
  index("pages/login.tsx"),

  // Protected admin routes
  layout("components/guards/AdminGuard.tsx", [
    layout("components/layouts/AdminLayout.tsx", [
      route("dashboard", "pages/admin/dashboard.tsx"),
      route("users", "pages/admin/users/index.tsx"),
      route("users/:id", "pages/admin/users/[id].tsx"),
      route("messes", "pages/admin/messes.tsx"),
      route("mess-requests", "pages/admin/mess-requests.tsx"),
      route("deletion-requests", "pages/admin/deletion-requests.tsx"),
      route("join-requests", "pages/admin/join-requests.tsx"),
      route("procurement-requests", "pages/admin/procurement-requests.tsx"),
      route("analytics", "pages/admin/analytics.tsx"),
      route("reports", "pages/admin/reports.tsx"),
      route("config", "pages/admin/config.tsx"),
    ]),
  ]),

  // 404
  route("*", "pages/not-found.tsx"),
] satisfies RouteConfig;

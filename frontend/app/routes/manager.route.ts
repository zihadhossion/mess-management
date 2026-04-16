import { route, prefix } from "@react-router/dev/routes";

const managerRoutes = prefix("manager", [
  route("dashboard", "pages/manager/dashboard.tsx"),
  route("menu", "pages/manager/menu.tsx"),
  route("members", "pages/manager/members/index.tsx"),
  route("members/join-requests", "pages/manager/members/join-requests.tsx"),
  route("meal-billing", "pages/manager/meal-billing/index.tsx"),
  route("meal-billing/daily-costs", "pages/manager/meal-billing/daily-costs.tsx"),
  route("meal-billing/fixed-charges", "pages/manager/meal-billing/fixed-charges.tsx"),
  route("meal-billing/item-types", "pages/manager/meal-billing/item-types.tsx"),
  route("meal-billing/finalize", "pages/manager/meal-billing/finalize.tsx"),
  route("meal-billing/history", "pages/manager/meal-billing/history.tsx"),
  route("shared-bills", "pages/manager/shared-bills/index.tsx"),
  route("shared-bills/history", "pages/manager/shared-bills/history.tsx"),
  route("notifications", "pages/manager/notifications.tsx"),
  route("settings", "pages/manager/settings.tsx"),
  route("settings/lifecycle", "pages/manager/settings/lifecycle.tsx"),
]);

export default managerRoutes;

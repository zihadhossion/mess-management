import { route, prefix } from "@react-router/dev/routes";

const memberRoutes = prefix("member", [
  route("dashboard", "pages/member/dashboard.tsx"),
  route("menu", "pages/member/menu.tsx"),
  route("meal-bills", "pages/member/meal-bills/index.tsx"),
  route("meal-bills/:id", "pages/member/meal-bills/detail.tsx"),
  route("shared-bills", "pages/member/shared-bills/index.tsx"),
  route("shared-bills/:id", "pages/member/shared-bills/detail.tsx"),
  route("feedback", "pages/member/feedback.tsx"),
  route("notifications", "pages/member/notifications.tsx"),
  route("settings", "pages/member/settings.tsx"),
  route("item-allocations", "pages/member/item-allocations.tsx"),
]);

export default memberRoutes;

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Bell, Info, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "~/redux/store/hooks";
import { fetchNotifications } from "~/redux/features/memberSlice";
import type { Notification } from "~/types/member.d";

const typeIcon = (type: Notification["type"]) => {
  if (type === "success")
    return <CheckCircle size={18} className="text-[#626F47]" />;
  if (type === "warning")
    return <AlertTriangle size={18} className="text-amber-600" />;
  if (type === "error") return <XCircle size={18} className="text-red-500" />;
  return <Info size={18} className="text-blue-500" />;
};

export default function NotificationsPage() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { notifications, isLoading } = useAppSelector((s) => s.member);

  const safeNotifications = Array.isArray(notifications)
    ? notifications
    : Array.isArray((notifications as any)?.data)
      ? (notifications as any).data
      : [];

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  return (
    <div className="min-h-full">
      <div className="bg-[#626F47] px-5 pt-3 pb-6 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-[120px] h-[120px] bg-[rgba(240,187,120,0.18)] rounded-full" />
        <div className="relative z-10">
          <h1 className="font-display font-bold text-[20px] text-[#F5ECD5]">
            {t("manager.notifications.title")}
          </h1>
          <p className="text-[13px] text-[rgba(245,236,213,0.72)]">
            {t("manager.notifications.subtitle")}
          </p>
        </div>
      </div>

      <div className="px-4 pt-4 md:max-w-3xl md:mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-[#626F47] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : safeNotifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 bg-[rgba(98,111,71,0.1)] rounded-full flex items-center justify-center mx-auto mb-3">
              <Bell size={28} className="text-[#A09070]" />
            </div>
            <p className="text-[14px] text-[#6B7550] font-semibold">
              {t("manager.notifications.noData")}
            </p>
          </div>
        ) : (
          safeNotifications.map((notif: any) => (
            <div
              key={notif.id}
              className={`flex items-start gap-3 bg-[#FBF5E8] border rounded-[14px] p-4 mb-3 ${notif.isRead ? "border-[#D9CEB4]" : "border-[#626F47]"}`}
            >
              <div className="mt-0.5 shrink-0">{typeIcon(notif.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[14px] text-[#2C2F1E]">
                  {notif.title}
                </div>
                <p className="text-[12px] text-[#6B7550] mt-0.5">
                  {notif.message}
                </p>
              </div>
              {!notif.isRead && (
                <div className="w-2 h-2 bg-[#626F47] rounded-full mt-1.5 shrink-0" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

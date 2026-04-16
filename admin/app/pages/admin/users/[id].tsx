import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  UserCheck,
  PauseCircle,
  Ban,
  Key,
  Trash2,
  ChevronRight,
  Users,
  X,
} from "lucide-react";
import { SelectDropdown } from "~/components/ui/SelectDropdown";
import {
  getUserById,
  activateUser,
  suspendUser,
  banUser,
  resetUserPassword,
  deleteUser,
  updateUserRole,
} from "~/services/httpServices/adminService";
import { getErrorMessage } from "~/utils/errorHandler";
import type { AdminUser } from "~/types/admin.d";
import { format } from "date-fns";

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    getUserById(id)
      .then((res) => {
        setUser(res.data);
        setSelectedRole(res.data.role);
      })
      .catch(() => setError("Failed to load user details"))
      .finally(() => setIsLoading(false));
  }, [id]);

  async function handleAction(action: string, fn: () => Promise<void>) {
    setActionError(null);
    setActionSuccess(null);
    setActionLoading(action);
    try {
      await fn();
      if (action === "delete") {
        navigate("/users");
        return;
      }
      // Refresh user data
      if (id) {
        const res = await getUserById(id);
        setUser(res.data);
      }
      setActionSuccess(`Action completed successfully.`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRoleChange() {
    if (!id || !selectedRole || selectedRole === user?.role) return;
    await handleAction("role", () => updateUserRole(id, selectedRole));
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 border-2 border-[#626F47] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6 text-center py-24">
        <Users size={32} className="text-[#A09070] mx-auto mb-3" />
        <p className="text-[17px] text-[#6B7550] font-semibold">
          {error ?? "User not found"}
        </p>
        <Link
          to="/users"
          className="mt-4 inline-block text-[#626F47] font-semibold text-[15px] underline"
        >
          Back to Users
        </Link>
      </div>
    );
  }

  const joinedDate = (() => {
    try {
      return format(new Date(user.createdAt), "MMMM d, yyyy");
    } catch {
      return user.createdAt;
    }
  })();

  return (
    <div className="p-6">
      {/* Topbar breadcrumb */}
      <div className="flex items-center gap-2 text-[15px] text-[#6B7550] mb-5">
        <Link
          to="/users"
          className="flex items-center gap-1 hover:text-[#626F47]"
        >
          <Users size={14} />
          Users
        </Link>
        <ChevronRight size={14} />
        <span className="font-semibold text-[#2C2F1E]">{user.name}</span>
      </div>

      {actionError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-[12px] text-[15px] text-red-700">
          {actionError}
        </div>
      )}
      {actionSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-[12px] text-[15px] text-green-700">
          {actionSuccess}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 items-start">
        {/* Left column */}
        <div>
          {/* User header card */}
          <div className="bg-white border border-[#D9CEB4] rounded-[12px] p-[22px] shadow-[0_1px_4px_rgba(74,60,30,0.06)] mb-[18px]">
            <div className="flex items-center gap-[18px] mb-[18px] pb-[18px] border-b border-[#EAE0CC]">
              <div className="w-16 h-16 rounded-full bg-[#626F47] flex items-center justify-center font-display font-bold text-2xl text-[#F5ECD5] shrink-0">
                {user.name[0]?.toUpperCase()}
              </div>
              <div>
                <div className="font-display font-bold text-[22px] text-[#2C2F1E]">
                  {user.name}
                </div>
                <div className="text-[15px] text-[#6B7550] mt-1">
                  {user.email}
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-[13px] font-semibold bg-[rgba(98,111,71,0.15)] text-[#3d5016] capitalize">
                    {user.role}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-[13px] font-semibold ${
                      user.isActive
                        ? "bg-[rgba(164,180,101,0.2)] text-[#3d5016]"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                  {user.isEmailVerified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-[13px] font-semibold bg-blue-50 text-blue-700">
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-base font-display font-bold text-[#2C2F1E] mb-[14px]">
              Account Information
            </div>
            <div className="grid grid-cols-2 gap-[14px]">
              {[
                { label: "User ID", value: user.id, mono: true },
                { label: "Joined", value: joinedDate },
                {
                  label: "Email Verified",
                  value: user.isEmailVerified ? "Yes" : "No",
                },
                {
                  label: "Status",
                  value: user.isActive ? "Active" : "Inactive",
                },
              ].map(({ label, value, mono }) => (
                <div key={label}>
                  <div className="text-xs font-semibold text-[#6B7550] uppercase tracking-[0.07em] mb-[3px]">
                    {label}
                  </div>
                  <div
                    className={`text-[15px] text-[#2C2F1E] ${mono ? "font-display text-sm" : ""}`}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mess info card */}
          {user.messId && (
            <div className="bg-white border border-[#D9CEB4] rounded-[12px] p-[22px] shadow-[0_1px_4px_rgba(74,60,30,0.06)] mb-[18px]">
              <div className="text-base font-display font-bold text-[#2C2F1E] mb-[14px]">
                Mess Information
              </div>
              <div className="grid grid-cols-2 gap-[14px]">
                {[
                  { label: "Mess Name", value: user.messName ?? "—" },
                  { label: "Mess ID", value: user.messId, mono: true },
                  { label: "Role in Mess", value: user.role },
                ].map(({ label, value, mono }) => (
                  <div key={label}>
                    <div className="text-xs font-semibold text-[#6B7550] uppercase tracking-[0.07em] mb-[3px]">
                      {label}
                    </div>
                    <div
                      className={`text-[15px] text-[#2C2F1E] capitalize ${mono ? "font-display text-sm" : ""}`}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment history placeholder */}
          <div className="bg-white border border-[#D9CEB4] rounded-[12px] p-[22px] shadow-[0_1px_4px_rgba(74,60,30,0.06)] mb-[18px]">
            <div className="text-base font-display font-bold text-[#2C2F1E] mb-[14px]">
              Payment History
            </div>
            <div className="text-center py-8 text-[15px] text-[#A09070]">
              No payment records available
            </div>
          </div>

          {/* Activity log placeholder */}
          <div className="bg-white border border-[#D9CEB4] rounded-[12px] p-[22px] shadow-[0_1px_4px_rgba(74,60,30,0.06)]">
            <div className="text-base font-display font-bold text-[#2C2F1E] mb-[14px]">
              Recent Activity
            </div>
            <div className="text-center py-8 text-[15px] text-[#A09070]">
              No recent activity
            </div>
          </div>
        </div>

        {/* Right column: actions */}
        <div>
          {/* Account Actions */}
          <div className="bg-white border border-[#D9CEB4] rounded-[12px] p-[20px] shadow-[0_1px_4px_rgba(74,60,30,0.06)] mb-4">
            <div className="text-base font-display font-bold text-[#2C2F1E] mb-[14px]">
              Account Actions
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() =>
                  handleAction("activate", () => activateUser(user.id))
                }
                disabled={!!actionLoading}
                className="flex items-center gap-[9px] px-[14px] py-[10px] rounded-[9px] text-[15px] font-semibold border border-[#626F47] text-[#626F47] hover:bg-[rgba(98,111,71,0.1)] transition-colors disabled:opacity-50 w-full"
              >
                <UserCheck size={15} className="shrink-0" />
                {actionLoading === "activate"
                  ? "Processing..."
                  : "Activate Account"}
              </button>
              <button
                onClick={() =>
                  handleAction("suspend", () => suspendUser(user.id))
                }
                disabled={!!actionLoading}
                className="flex items-center gap-[9px] px-[14px] py-[10px] rounded-[9px] text-[15px] font-semibold border border-[#c68a30] text-[#7a4e0e] hover:bg-[rgba(240,187,120,0.15)] transition-colors disabled:opacity-50 w-full"
              >
                <PauseCircle size={15} className="shrink-0" />
                {actionLoading === "suspend"
                  ? "Processing..."
                  : "Suspend Account"}
              </button>
              <button
                onClick={() => handleAction("ban", () => banUser(user.id))}
                disabled={!!actionLoading}
                className="flex items-center gap-[9px] px-[14px] py-[10px] rounded-[9px] text-[15px] font-semibold border border-[#c0392b] text-[#c0392b] hover:bg-[rgba(192,57,43,0.08)] transition-colors disabled:opacity-50 w-full"
              >
                <Ban size={15} className="shrink-0" />
                {actionLoading === "ban" ? "Processing..." : "Ban Account"}
              </button>
              <button
                onClick={() =>
                  handleAction("reset", () => resetUserPassword(user.id))
                }
                disabled={!!actionLoading}
                className="flex items-center gap-[9px] px-[14px] py-[10px] rounded-[9px] text-[15px] font-semibold border border-[#626F47] text-[#626F47] hover:bg-[rgba(98,111,71,0.1)] transition-colors disabled:opacity-50 w-full"
              >
                <Key size={15} className="shrink-0" />
                {actionLoading === "reset" ? "Processing..." : "Reset Password"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={!!actionLoading}
                className="flex items-center gap-[9px] px-[14px] py-[10px] rounded-[9px] text-[15px] font-semibold border border-[#c0392b] text-[#c0392b] hover:bg-[rgba(192,57,43,0.08)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
              >
                <Trash2 size={15} className="shrink-0" />
                {actionLoading === "delete" ? "Deleting..." : "Delete Account"}
              </button>
            </div>

            {/* Change Role */}
            <div className="mt-[14px]">
              <div className="text-[13px] font-semibold text-[#6B7550] uppercase tracking-[0.07em] mb-[6px]">
                Change Role
              </div>
              <SelectDropdown
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full bg-[#fff9ee] rounded-[8px] py-[9px] text-[15px]"
              >
                <option value="member">Member</option>
                <option value="manager">Manager</option>
              </SelectDropdown>
              <button
                onClick={handleRoleChange}
                disabled={!!actionLoading || selectedRole === user.role}
                className="mt-2 w-full bg-[#626F47] text-[#F5ECD5] font-semibold text-[15px] py-2 rounded-[8px] disabled:opacity-50 transition-colors hover:bg-[#4d5638]"
              >
                {actionLoading === "role" ? "Updating..." : "Apply Role Change"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
        >
          <div className="bg-white rounded-[20px] p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2
                id="delete-dialog-title"
                className="font-display font-bold text-xl text-[#2C2F1E]"
              >
                Delete Account
              </h2>
              <button
                aria-label="Close dialog"
                onClick={() => setShowDeleteConfirm(false)}
                className="text-[#A09070] hover:text-[#2C2F1E]"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-base text-[#6B7550] mb-6">
              Delete account for <strong>{user?.name}</strong>? This action
              cannot be undone and will permanently remove all associated data.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-[10px] border border-[#D9CEB4] text-[#6B7550] font-semibold text-[15px]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  if (user) handleAction("delete", () => deleteUser(user.id));
                }}
                className="flex-1 py-2.5 rounded-[10px] bg-red-600 text-white font-semibold text-[15px]"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

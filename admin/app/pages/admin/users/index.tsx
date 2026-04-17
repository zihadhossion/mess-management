import { useEffect, useState, useMemo } from "react";
import {
  Search,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Download,
  Trash2,
  CheckSquare,
  Square,
  AlertTriangle,
  X,
  UserPlus,
} from "lucide-react";
import { SelectDropdown } from "~/components/ui/SelectDropdown";
import { Link } from "react-router";
import { useAppDispatch, useAppSelector } from "~/redux/store/hooks";
import { fetchAdminUsers } from "~/redux/features/adminSlice";
import {
  activateUser,
  suspendUser,
  deleteUser,
  createUser,
} from "~/services/httpServices/adminService";
import { getErrorMessage } from "~/utils/errorHandler";
import type { AdminUser } from "~/types/admin.d";

type SortKey = "name" | "email" | "role" | "status" | "messName";
type SortDir = "asc" | "desc";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function exportCSV(rows: AdminUser[], filename = "users.csv") {
  const cols = ["Name", "Email", "Role", "Status", "Mess", "Email Verified", "Created At"];
  const body = rows.map((u) =>
    [
      u.name,
      u.email,
      u.role,
      u.isActive ? "Active" : "Inactive",
      u.messName ?? "",
      u.isEmailVerified ? "Yes" : "No",
      u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-GB") : "",
    ]
      .map((v) => (String(v).includes(",") ? `"${v}"` : v))
      .join(","),
  );
  const csv = [cols.join(","), ...body].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function SortableHeader({
  label,
  sortKey,
  current,
  dir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const active = current === sortKey;
  return (
    <th
      className="text-left px-4 py-3 text-[13px] font-semibold text-[#6B7550] uppercase tracking-[0.06em] cursor-pointer select-none hover:text-[#2C2F1E] transition-colors"
      onClick={() => onSort(sortKey)}
    >
      <span className="flex items-center gap-1">
        {label}
        <span className="flex flex-col">
          <ChevronUp
            size={10}
            className={active && dir === "asc" ? "text-[#626F47]" : "text-[#D6CEBA]"}
          />
          <ChevronDown
            size={10}
            className={active && dir === "desc" ? "text-[#626F47]" : "text-[#D6CEBA]"}
          />
        </span>
      </span>
    </th>
  );
}

export default function AdminUsersPage() {
  const dispatch = useAppDispatch();
  const { users, isLoading, totalUsers } = useAppSelector((s) => s.admin);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Create user modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", email: "", role: "member" });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  function load() {
    dispatch(
      fetchAdminUsers({
        page,
        limit,
        role: roleFilter || undefined,
        isActive: statusFilter !== "" ? statusFilter : undefined,
      }),
    );
  }

  useEffect(() => {
    load();
    setSelected(new Set());
  }, [dispatch, page, limit, roleFilter, statusFilter]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const base = q
      ? users.filter(
          (u) =>
            u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
        )
      : users;

    return [...base].sort((a, b) => {
      let av: string, bv: string;
      switch (sortKey) {
        case "name":      av = a.name;            bv = b.name;            break;
        case "email":     av = a.email;           bv = b.email;           break;
        case "role":      av = a.role;            bv = b.role;            break;
        case "status":    av = String(a.isActive); bv = String(b.isActive); break;
        case "messName":  av = a.messName ?? "";  bv = b.messName ?? "";  break;
        default:          av = a.name;            bv = b.name;
      }
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [users, search, sortKey, sortDir]);

  const totalPages = Math.ceil(totalUsers / limit);
  const startItem = totalUsers === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalUsers);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const allSelected =
    filtered.length > 0 && filtered.every((u) => selected.has(u.id));

  function toggleSelectAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((u) => u.id)));
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleBulkAction(action: "activate" | "deactivate" | "delete") {
    if (selected.size === 0) return;
    setBulkError(null);
    setBulkLoading(true);
    try {
      const ids = Array.from(selected);
      await Promise.all(
        ids.map((id) => {
          if (action === "activate") return activateUser(id);
          if (action === "deactivate") return suspendUser(id);
          return deleteUser(id);
        }),
      );
      setSelected(new Set());
      setConfirmDelete(false);
      load();
    } catch (err) {
      setBulkError(getErrorMessage(err));
    } finally {
      setBulkLoading(false);
    }
  }

  function getPageNumbers(): (number | "...")[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [];
    if (page <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (page >= totalPages - 3) {
      pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
    }
    return pages;
  }

  async function handleCreateUser() {
    if (!createForm.name.trim() || !createForm.email.trim()) return;
    setCreateLoading(true);
    setCreateError(null);
    try {
      await createUser(createForm);
      setShowCreateModal(false);
      setCreateForm({ name: "", email: "", role: "member" });
      load();
    } catch (err) {
      setCreateError(getErrorMessage(err));
    } finally {
      setCreateLoading(false);
    }
  }

  const selectedCount = selected.size;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-[26px] text-[#2C2F1E]">Users</h1>
          <p className="text-base text-[#6B7550]">{totalUsers} total registered users</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#626F47] text-[#F5ECD5] rounded-[10px] text-[14px] font-semibold hover:bg-[#4d5638] transition-colors"
          >
            <UserPlus size={15} /> Create User
          </button>
          <button
            onClick={() => exportCSV(filtered)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#D9CEB4] rounded-[10px] text-[14px] font-semibold text-[#6B7550] hover:bg-[#FAF7F0] transition-colors"
          >
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A09070]" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email..."
            className="w-full bg-white border border-[#D9CEB4] rounded-[12px] pl-10 pr-4 py-2.5 text-base text-[#2C2F1E] outline-none focus:border-[#626F47] placeholder:text-[#C0B090]"
          />
        </div>
        <SelectDropdown value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
          <option value="">All Roles</option>
          <option value="member">Member</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </SelectDropdown>
        <SelectDropdown value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </SelectDropdown>
        <SelectDropdown value={String(limit)} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}>
          {PAGE_SIZE_OPTIONS.map((n) => (
            <option key={n} value={n}>{n} / page</option>
          ))}
        </SelectDropdown>
      </div>

      {/* Bulk action bar */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-3 mb-4 px-4 py-2.5 bg-[#626F47] rounded-[12px]">
          <span className="text-[14px] font-semibold text-[#F5ECD5]">
            {selectedCount} selected
          </span>
          <div className="flex-1" />
          <button
            onClick={() => handleBulkAction("activate")}
            disabled={bulkLoading}
            className="px-3 py-1.5 bg-green-600 text-white text-[13px] font-semibold rounded-[8px] disabled:opacity-50 hover:bg-green-700 transition-colors"
          >
            Activate
          </button>
          <button
            onClick={() => handleBulkAction("deactivate")}
            disabled={bulkLoading}
            className="px-3 py-1.5 bg-amber-500 text-white text-[13px] font-semibold rounded-[8px] disabled:opacity-50 hover:bg-amber-600 transition-colors"
          >
            Deactivate
          </button>
          <button
            onClick={() => exportCSV(filtered.filter((u) => selected.has(u.id)), "users-selected.csv")}
            className="px-3 py-1.5 bg-white/20 text-[#F5ECD5] text-[13px] font-semibold rounded-[8px] hover:bg-white/30 transition-colors"
          >
            Export
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            disabled={bulkLoading}
            className="px-3 py-1.5 bg-red-600 text-white text-[13px] font-semibold rounded-[8px] disabled:opacity-50 hover:bg-red-700 transition-colors"
          >
            <Trash2 size={13} />
          </button>
          <button onClick={() => setSelected(new Set())} className="text-[#F5ECD5]/70 hover:text-[#F5ECD5]">
            <X size={16} />
          </button>
        </div>
      )}

      {bulkError && (
        <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-[12px] text-[15px] text-red-700">
          {bulkError}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#626F47] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users size={32} className="text-[#A09070] mx-auto mb-3" />
          <p className="text-[17px] text-[#6B7550] font-semibold">No users found</p>
        </div>
      ) : (
        <>
          <div className="bg-white border border-[#E8E0D0] rounded-[16px] overflow-hidden shadow-[0_2px_8px_rgba(74,60,30,0.06)]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E8E0D0] bg-[#FAF7F0]">
                  <th className="px-4 py-3 w-10">
                    <button onClick={toggleSelectAll} className="text-[#6B7550] hover:text-[#626F47]">
                      {allSelected ? <CheckSquare size={17} /> : <Square size={17} />}
                    </button>
                  </th>
                  <SortableHeader label="Name"   sortKey="name"     current={sortKey} dir={sortDir} onSort={handleSort} />
                  <SortableHeader label="Email"  sortKey="email"    current={sortKey} dir={sortDir} onSort={handleSort} />
                  <SortableHeader label="Role"   sortKey="role"     current={sortKey} dir={sortDir} onSort={handleSort} />
                  <SortableHeader label="Status" sortKey="status"   current={sortKey} dir={sortDir} onSort={handleSort} />
                  <SortableHeader label="Mess"   sortKey="messName" current={sortKey} dir={sortDir} onSort={handleSort} />
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr
                    key={user.id}
                    className={`border-b border-[#F0EBE0] last:border-b-0 hover:bg-[#FAF7F0] transition-colors ${selected.has(user.id) ? "bg-[#F5ECD5]" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleSelect(user.id)}
                        className="text-[#6B7550] hover:text-[#626F47]"
                      >
                        {selected.has(user.id) ? <CheckSquare size={17} /> : <Square size={17} />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/users/${user.id}`} className="flex items-center gap-2.5 hover:underline">
                        <div className="w-8 h-8 rounded-full bg-[#F0BB78] flex items-center justify-center font-bold text-[15px] text-[#2C2F1E] shrink-0">
                          {user.name[0]?.toUpperCase()}
                        </div>
                        <span className="font-semibold text-base text-[#2C2F1E]">{user.name}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[15px] text-[#6B7550]">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className="text-[13px] font-semibold px-2 py-0.5 rounded-full bg-[rgba(98,111,71,0.1)] text-[#626F47] capitalize">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[13px] font-semibold px-2 py-0.5 rounded-full ${user.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[15px] text-[#6B7550]">
                      {user.messName ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-[15px] text-[#6B7550]">
                Showing {startItem}–{endItem} of {totalUsers} users
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-[8px] border border-[#D9CEB4] text-[#6B7550] hover:bg-[#FAF7F0] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={15} />
                </button>
                {getPageNumbers().map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-[15px] text-[#A09070]">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 flex items-center justify-center rounded-[8px] text-[15px] font-medium border transition-colors ${p === page ? "bg-[#626F47] text-white border-[#626F47]" : "border-[#D9CEB4] text-[#6B7550] hover:bg-[#FAF7F0]"}`}
                    >
                      {p}
                    </button>
                  ),
                )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-[8px] border border-[#D9CEB4] text-[#6B7550] hover:bg-[#FAF7F0] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create User modal */}
      {showCreateModal && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[20px] p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-xl text-[#2C2F1E]">Create User</h2>
              <button onClick={() => { setShowCreateModal(false); setCreateError(null); }} className="text-[#A09070] hover:text-[#2C2F1E]">
                <X size={20} />
              </button>
            </div>
            {createError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-[10px] text-[14px] text-red-700">{createError}</div>
            )}
            <div className="space-y-3">
              <div>
                <label className="block text-[13px] font-semibold text-[#6B7550] mb-1">Full Name</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Enter full name"
                  className="w-full border border-[#D9CEB4] rounded-[8px] px-3 py-2 text-[14px] text-[#2C2F1E] outline-none focus:border-[#626F47]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-[#6B7550] mb-1">Email</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="Enter email address"
                  className="w-full border border-[#D9CEB4] rounded-[8px] px-3 py-2 text-[14px] text-[#2C2F1E] outline-none focus:border-[#626F47]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-[#6B7550] mb-1">Role</label>
                <SelectDropdown value={createForm.role} onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value }))}>
                  <option value="member">Member</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </SelectDropdown>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => { setShowCreateModal(false); setCreateError(null); }}
                className="flex-1 py-2.5 rounded-[10px] border border-[#D9CEB4] text-[#6B7550] font-semibold text-[15px]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                disabled={createLoading || !createForm.name.trim() || !createForm.email.trim()}
                className="flex-1 py-2.5 rounded-[10px] bg-[#626F47] text-white font-semibold text-[15px] disabled:opacity-50"
              >
                {createLoading ? "Creating..." : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk delete confirmation */}
      {confirmDelete && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[20px] p-6 w-full max-w-md shadow-xl">
            <div className="flex gap-3 mb-4 text-red-700">
              <AlertTriangle size={22} className="shrink-0 mt-0.5" />
              <div>
                <h2 className="font-display font-bold text-xl text-[#2C2F1E] mb-1">Delete {selectedCount} users?</h2>
                <p className="text-[15px] text-[#6B7550]">This action is permanent and cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2.5 rounded-[10px] border border-[#D9CEB4] text-[#6B7550] font-semibold text-[15px]">
                Cancel
              </button>
              <button
                onClick={() => handleBulkAction("delete")}
                disabled={bulkLoading}
                className="flex-1 py-2.5 rounded-[10px] bg-red-600 text-white font-semibold text-[15px] disabled:opacity-50"
              >
                {bulkLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

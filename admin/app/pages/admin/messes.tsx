import { useEffect, useState, useMemo } from "react";
import {
  Search,
  Building2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  X,
  MapPin,
  Users,
  Copy,
  Check,
  AlertTriangle,
  PowerOff,
  Download,
  CheckSquare,
  Square,
} from "lucide-react";
import { SelectDropdown } from "~/components/ui/SelectDropdown";
import { useAppDispatch, useAppSelector } from "~/redux/store/hooks";
import { fetchAdminMesses } from "~/redux/features/adminSlice";
import {
  getMessDetail,
  forceDeactivateMess,
} from "~/services/httpServices/adminService";
import { getErrorMessage } from "~/utils/errorHandler";
import type { AdminMess, MessDetail } from "~/types/admin.d";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

type MessSortKey = "name" | "code" | "managerName" | "memberCount" | "status";
type SortDir = "asc" | "desc";

const STATUS_BADGE: Record<string, string> = {
  active: "bg-[rgba(98,111,71,0.12)] text-[#626F47]",
  inactive: "bg-red-50 text-red-600",
  pending: "bg-amber-50 text-amber-700",
  pending_approval: "bg-amber-50 text-amber-700",
  rejected: "bg-red-50 text-red-600",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-[#F0EBE0] last:border-0">
      <span className="text-[14px] text-[#6B7550]">{label}</span>
      <span className="text-[14px] font-semibold text-[#2C2F1E]">{value}</span>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <button
      onClick={handleCopy}
      title="Copy"
      className="ml-1 text-[#A09070] hover:text-[#626F47] transition-colors"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

function exportMembersCSV(detail: MessDetail) {
  const cols = ["Name", "Email", "Role", "Join Date", "Status"];
  const rows = detail.members.map((m) =>
    [m.name, m.email, m.role, m.joinDate ? formatDate(m.joinDate) : "", m.status].join(","),
  );
  const csv = [cols.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${detail.name}-members.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Drawer ────────────────────────────────────────────────────────────────────

function MessDetailDrawer({
  mess,
  onClose,
  onDeactivated,
}: {
  mess: AdminMess;
  onClose: () => void;
  onDeactivated: () => void;
}) {
  const [detail, setDetail] = useState<MessDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  useEffect(() => {
    setDetail(null);
    setLoadError(null);
    getMessDetail(mess.id)
      .then((res) => setDetail(res.data))
      .catch((err) => setLoadError(getErrorMessage(err)));
  }, [mess.id]);

  async function handleForceDeactivate() {
    setDeactivateError(null);
    setIsDeactivating(true);
    try {
      await forceDeactivateMess(mess.id);
      onDeactivated();
      onClose();
    } catch (err) {
      setDeactivateError(getErrorMessage(err));
    } finally {
      setIsDeactivating(false);
      setConfirmDeactivate(false);
    }
  }

  const statusLabel = mess.status?.toLowerCase().replace("_", " ") ?? "—";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`${mess.name} details`}
        className="fixed top-0 right-0 h-full w-[480px] max-w-full bg-white shadow-2xl z-50 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-[#F0EBE0] bg-[#FAF7F0]">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="font-display font-bold text-[20px] text-[#2C2F1E] truncate">
              {mess.name}
            </h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="font-display font-bold text-[13px] text-[#626F47] tracking-widest">
                {mess.code}
              </span>
              <CopyButton text={mess.code} />
              <span
                className={`text-[12px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[mess.status?.toLowerCase()] ?? "bg-gray-100 text-gray-600"}`}
              >
                {statusLabel}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close drawer"
            className="text-[#A09070] hover:text-[#2C2F1E] transition-colors mt-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {loadError ? (
            <div
              role="alert"
              className="p-4 bg-red-50 border border-red-200 rounded-[12px] text-[15px] text-red-700"
            >
              {loadError}
            </div>
          ) : !detail ? (
            <div className="flex justify-center py-16">
              <div className="w-7 h-7 border-2 border-[#626F47] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Basic Info */}
              <section>
                <h3 className="text-[13px] font-semibold text-[#6B7550] uppercase tracking-wider mb-2">
                  Basic Info
                </h3>
                <div className="bg-[#FAF7F0] rounded-[12px] px-4 py-1">
                  <StatRow label="Created" value={formatDate(detail.createdAt)} />
                  <StatRow label="Currency" value={detail.currency ?? "BDT"} />
                  <StatRow
                    label="Join Approval"
                    value={detail.requireJoinApproval ? "Required" : "Not required"}
                  />
                  <StatRow label="Members" value={detail.memberCount} />
                </div>
                {detail.address && (
                  <div className="flex gap-2 mt-3 text-[14px] text-[#6B7550]">
                    <MapPin size={15} className="shrink-0 mt-0.5 text-[#A09070]" />
                    <span>{detail.address}</span>
                  </div>
                )}
                {detail.description && (
                  <p className="mt-2 text-[14px] text-[#6B7550] italic">
                    {detail.description}
                  </p>
                )}
              </section>

              {/* Manager Info */}
              <section>
                <h3 className="text-[13px] font-semibold text-[#6B7550] uppercase tracking-wider mb-2">
                  Manager
                </h3>
                <div className="bg-[#FAF7F0] rounded-[12px] px-4 py-1">
                  <StatRow label="Name" value={detail.managerName} />
                  <StatRow label="Email" value={detail.managerEmail ?? "—"} />
                  {detail.coManagerName && (
                    <StatRow
                      label="Co-Manager"
                      value={`${detail.coManagerName}${detail.coManagerEmail ? ` (${detail.coManagerEmail})` : ""}`}
                    />
                  )}
                </div>
              </section>

              {/* Financial Summary */}
              {(detail.mealRevenuThisMonth != null ||
                detail.sharedBillsTotalThisMonth != null) && (
                <section>
                  <h3 className="text-[13px] font-semibold text-[#6B7550] uppercase tracking-wider mb-2">
                    Financial (This Month)
                  </h3>
                  <div className="bg-[#FAF7F0] rounded-[12px] px-4 py-1">
                    {detail.mealRevenuThisMonth != null && (
                      <StatRow
                        label="Meal Revenue"
                        value={`৳${detail.mealRevenuThisMonth.toLocaleString()}`}
                      />
                    )}
                    {detail.mealCollectionRate !== null && (
                      <StatRow
                        label="Meal Collection Rate"
                        value={`${detail.mealCollectionRate}%`}
                      />
                    )}
                    {detail.sharedBillsTotalThisMonth != null && (
                      <StatRow
                        label="Shared Bills Total"
                        value={`৳${detail.sharedBillsTotalThisMonth.toLocaleString()}`}
                      />
                    )}
                    {detail.sharedBillsCollectionRate !== null && (
                      <StatRow
                        label="Shared Bills Collection"
                        value={`${detail.sharedBillsCollectionRate}%`}
                      />
                    )}
                    {detail.sharedBillCategoriesCount !== null && (
                      <StatRow
                        label="Bill Categories"
                        value={detail.sharedBillCategoriesCount}
                      />
                    )}
                  </div>
                </section>
              )}

              {/* Health Metrics */}
              {detail.bookingRate !== null && (
                <section>
                  <h3 className="text-[13px] font-semibold text-[#6B7550] uppercase tracking-wider mb-2">
                    Health Metrics
                  </h3>
                  <div className="bg-[#FAF7F0] rounded-[12px] px-4 py-1">
                    <StatRow
                      label="Booking Rate"
                      value={`${detail.bookingRate}%`}
                    />
                  </div>
                </section>
              )}

              {/* Members List */}
              {detail.members && detail.members.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[13px] font-semibold text-[#6B7550] uppercase tracking-wider">
                      Members ({detail.members.length})
                    </h3>
                    <button
                      onClick={() => exportMembersCSV(detail)}
                      className="flex items-center gap-1 text-[13px] text-[#626F47] font-semibold hover:underline"
                    >
                      <Download size={13} /> Export CSV
                    </button>
                  </div>
                  <div className="bg-[#FAF7F0] rounded-[12px] overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-[#E8E0D0]">
                          <th className="px-3 py-2 text-[12px] font-semibold text-[#6B7550] uppercase">Name</th>
                          <th className="px-3 py-2 text-[12px] font-semibold text-[#6B7550] uppercase">Role</th>
                          <th className="px-3 py-2 text-[12px] font-semibold text-[#6B7550] uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.members.map((m) => (
                          <tr
                            key={m.id}
                            className="border-b border-[#F0EBE0] last:border-0"
                          >
                            <td className="px-3 py-2 text-[13px] text-[#2C2F1E] font-semibold">
                              {m.name}
                            </td>
                            <td className="px-3 py-2 text-[13px] text-[#6B7550] capitalize">
                              {m.role}
                            </td>
                            <td className="px-3 py-2">
                              <span
                                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${m.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}
                              >
                                {m.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* Actions */}
              <section>
                <h3 className="text-[13px] font-semibold text-[#6B7550] uppercase tracking-wider mb-3">
                  Admin Actions
                </h3>

                {deactivateError && (
                  <div
                    role="alert"
                    className="mb-3 p-3 bg-red-50 border border-red-200 rounded-[10px] text-[14px] text-red-700"
                  >
                    {deactivateError}
                  </div>
                )}

                {mess.status?.toLowerCase() !== "inactive" && (
                  <>
                    {!confirmDeactivate ? (
                      <button
                        onClick={() => setConfirmDeactivate(true)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[10px] border border-red-200 bg-red-50 text-red-600 font-semibold text-[15px] hover:bg-red-100 transition-colors"
                      >
                        <PowerOff size={15} /> Force Deactivate
                      </button>
                    ) : (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-[12px]">
                        <div className="flex gap-2 mb-3 text-red-700 text-[14px]">
                          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                          <p>
                            This will immediately deactivate the mess. All members will lose access. Are you sure?
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setConfirmDeactivate(false)}
                            className="flex-1 py-2 rounded-[8px] border border-[#D9CEB4] text-[#6B7550] font-semibold text-[14px]"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleForceDeactivate}
                            disabled={isDeactivating}
                            className="flex-1 py-2 rounded-[8px] bg-red-600 text-white font-semibold text-[14px] disabled:opacity-50"
                          >
                            {isDeactivating ? "Deactivating..." : "Yes, Deactivate"}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </section>
            </>
          )}
        </div>
      </aside>
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

function MessSortableHeader({
  label,
  sortKey,
  current,
  dir,
  onSort,
}: {
  label: string;
  sortKey: MessSortKey;
  current: MessSortKey;
  dir: SortDir;
  onSort: (k: MessSortKey) => void;
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
          <ChevronUp size={10} className={active && dir === "asc" ? "text-[#626F47]" : "text-[#D6CEBA]"} />
          <ChevronDown size={10} className={active && dir === "desc" ? "text-[#626F47]" : "text-[#D6CEBA]"} />
        </span>
      </span>
    </th>
  );
}

function exportMessCSV(rows: AdminMess[], filename = "messes.csv") {
  const cols = ["Name", "Code", "Manager", "Members", "Status", "Created At"];
  const body = rows.map((m) =>
    [
      m.name,
      m.code,
      m.managerName,
      m.memberCount,
      m.status,
      m.createdAt ? new Date(m.createdAt).toLocaleDateString("en-GB") : "",
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

export default function AdminMessesPage() {
  const dispatch = useAppDispatch();
  const { messes, isLoading, totalMesses } = useAppSelector((s) => s.admin);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState("");
  const [sortKey, setSortKey] = useState<MessSortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectedMess, setSelectedMess] = useState<AdminMess | null>(null);

  function load() {
    dispatch(fetchAdminMesses({ page, limit, status: statusFilter || undefined }));
  }

  useEffect(() => {
    load();
    setSelected(new Set());
  }, [dispatch, page, limit, statusFilter]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const base = q
      ? messes.filter(
          (m) => m.name.toLowerCase().includes(q) || m.code.toLowerCase().includes(q),
        )
      : messes;
    return [...base].sort((a, b) => {
      let av: string | number, bv: string | number;
      switch (sortKey) {
        case "name":        av = a.name;         bv = b.name;         break;
        case "code":        av = a.code;         bv = b.code;         break;
        case "managerName": av = a.managerName;  bv = b.managerName;  break;
        case "memberCount": av = a.memberCount;  bv = b.memberCount;  break;
        case "status":      av = a.status;       bv = b.status;       break;
        default:            av = a.name;         bv = b.name;
      }
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [messes, search, sortKey, sortDir]);

  const totalPages = Math.ceil(totalMesses / limit);
  const startItem = totalMesses === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalMesses);

  function handleSort(key: MessSortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  const allSelected = filtered.length > 0 && filtered.every((m) => selected.has(m.id));

  function toggleSelectAll() {
    setSelected(allSelected ? new Set() : new Set(filtered.map((m) => m.id)));
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

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-[26px] text-[#2C2F1E]">Messes</h1>
          <p className="text-base text-[#6B7550]">{totalMesses} total registered messes</p>
        </div>
        <button
          onClick={() => exportMessCSV(selected.size > 0 ? filtered.filter((m) => selected.has(m.id)) : filtered)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-[#D9CEB4] rounded-[10px] text-[14px] font-semibold text-[#6B7550] hover:bg-[#FAF7F0] transition-colors"
        >
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A09070]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search messes..."
            className="w-full bg-white border border-[#D9CEB4] rounded-[12px] pl-10 pr-4 py-2.5 text-base text-[#2C2F1E] outline-none focus:border-[#626F47] placeholder:text-[#C0B090]"
          />
        </div>
        <SelectDropdown value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="PENDING_APPROVAL">Pending Approval</option>
          <option value="REJECTED">Rejected</option>
        </SelectDropdown>
        <SelectDropdown value={String(limit)} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}>
          {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n} / page</option>)}
        </SelectDropdown>
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-4 px-4 py-2.5 bg-[#626F47] rounded-[12px]">
          <span className="text-[14px] font-semibold text-[#F5ECD5]">{selected.size} selected</span>
          <div className="flex-1" />
          <button
            onClick={() => exportMessCSV(filtered.filter((m) => selected.has(m.id)), "messes-selected.csv")}
            className="px-3 py-1.5 bg-white/20 text-[#F5ECD5] text-[13px] font-semibold rounded-[8px] hover:bg-white/30 transition-colors"
          >
            Export
          </button>
          <button onClick={() => setSelected(new Set())} className="text-[#F5ECD5]/70 hover:text-[#F5ECD5]">
            <X size={16} />
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#626F47] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Building2 size={32} className="text-[#A09070] mx-auto mb-3" />
          <p className="text-[17px] text-[#6B7550] font-semibold">No messes found</p>
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
                  <MessSortableHeader label="Name"    sortKey="name"        current={sortKey} dir={sortDir} onSort={handleSort} />
                  <MessSortableHeader label="Code"    sortKey="code"        current={sortKey} dir={sortDir} onSort={handleSort} />
                  <MessSortableHeader label="Manager" sortKey="managerName" current={sortKey} dir={sortDir} onSort={handleSort} />
                  <MessSortableHeader label="Members" sortKey="memberCount" current={sortKey} dir={sortDir} onSort={handleSort} />
                  <MessSortableHeader label="Status"  sortKey="status"      current={sortKey} dir={sortDir} onSort={handleSort} />
                </tr>
              </thead>
              <tbody>
                {filtered.map((mess) => (
                  <tr
                    key={mess.id}
                    onClick={() => setSelectedMess(mess)}
                    className={`border-b border-[#F0EBE0] last:border-b-0 hover:bg-[#FAF7F0] cursor-pointer transition-colors ${selected.has(mess.id) ? "bg-[#F5ECD5]" : ""}`}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelected((prev) => { const n = new Set(prev); n.has(mess.id) ? n.delete(mess.id) : n.add(mess.id); return n; })}
                        className="text-[#6B7550] hover:text-[#626F47]"
                      >
                        {selected.has(mess.id) ? <CheckSquare size={17} /> : <Square size={17} />}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-semibold text-base text-[#2C2F1E]">{mess.name}</td>
                    <td className="px-4 py-3 font-display font-bold text-[15px] text-[#626F47] tracking-wider">{mess.code}</td>
                    <td className="px-4 py-3 text-[15px] text-[#6B7550]">{mess.managerName}</td>
                    <td className="px-4 py-3 text-[15px] text-[#2C2F1E]">
                      <span className="flex items-center gap-1">
                        <Users size={13} className="text-[#A09070]" />
                        {mess.memberCount}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[13px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[mess.status?.toLowerCase()] ?? "bg-gray-100 text-gray-600"}`}>
                        {mess.status?.toLowerCase().replace("_", " ")}
                      </span>
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
                Showing {startItem}–{endItem} of {totalMesses} messes
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
                    <span
                      key={`ellipsis-${i}`}
                      className="w-8 h-8 flex items-center justify-center text-[15px] text-[#A09070]"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 flex items-center justify-center rounded-[8px] text-[15px] font-medium border transition-colors ${
                        p === page
                          ? "bg-[#626F47] text-white border-[#626F47]"
                          : "border-[#D9CEB4] text-[#6B7550] hover:bg-[#FAF7F0]"
                      }`}
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

      {/* Mess Detail Drawer */}
      {selectedMess && (
        <MessDetailDrawer
          mess={selectedMess}
          onClose={() => setSelectedMess(null)}
          onDeactivated={() => {
            setSelectedMess(null);
            load();
          }}
        />
      )}
    </div>
  );
}

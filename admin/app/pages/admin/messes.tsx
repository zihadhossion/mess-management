import { useEffect, useState } from "react";
import { Search, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { SelectDropdown } from "~/components/ui/SelectDropdown";
import { useAppDispatch, useAppSelector } from "~/redux/store/hooks";
import { fetchAdminMesses } from "~/redux/features/adminSlice";

const LIMIT = 10;

export default function AdminMessesPage() {
  const dispatch = useAppDispatch();
  const { messes, isLoading, totalMesses } = useAppSelector((s) => s.admin);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    dispatch(
      fetchAdminMesses({
        page,
        limit: LIMIT,
        status: statusFilter || undefined,
      }),
    );
  }, [dispatch, page, statusFilter]);

  const filtered = messes.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.code.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(totalMesses / LIMIT);
  const startItem = totalMesses === 0 ? 0 : (page - 1) * LIMIT + 1;
  const endItem = Math.min(page * LIMIT, totalMesses);

  function handleStatusChange(value: string) {
    setStatusFilter(value);
    setPage(1);
  }

  function getPageNumbers(): (number | "...")[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
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
          <h1 className="font-display font-bold text-[24px] text-[#2C2F1E]">
            Messes
          </h1>
          <p className="text-[14px] text-[#6B7550]">
            {totalMesses} total registered messes
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A09070]"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search messes..."
            className="w-full bg-white border border-[#D9CEB4] rounded-[12px] pl-10 pr-4 py-2.5 text-[14px] text-[#2C2F1E] outline-none focus:border-[#626F47] placeholder:text-[#C0B090]"
          />
        </div>
        <SelectDropdown
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="PENDING_APPROVAL">Pending Approval</option>
          <option value="REJECTED">Rejected</option>
        </SelectDropdown>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#626F47] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Building2 size={32} className="text-[#A09070] mx-auto mb-3" />
          <p className="text-[15px] text-[#6B7550] font-semibold">
            No messes found
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white border border-[#E8E0D0] rounded-[16px] overflow-hidden shadow-[0_2px_8px_rgba(74,60,30,0.06)]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E8E0D0] bg-[#FAF7F0]">
                  {["Name", "Code", "Manager", "Members", "Status"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-[11px] font-semibold text-[#6B7550] uppercase tracking-[0.06em]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((mess) => (
                  <tr
                    key={mess.id}
                    className="border-b border-[#F0EBE0] last:border-b-0 hover:bg-[#FAF7F0]"
                  >
                    <td className="px-4 py-3 font-semibold text-[14px] text-[#2C2F1E]">
                      {mess.name}
                    </td>
                    <td className="px-4 py-3 font-display font-bold text-[13px] text-[#626F47] tracking-wider">
                      {mess.code}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[#6B7550]">
                      {mess.managerName}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[#2C2F1E]">
                      {mess.memberCount}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                          mess.status === "active"
                            ? "bg-[rgba(98,111,71,0.12)] text-[#626F47]"
                            : mess.status === "pending"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-red-50 text-red-600"
                        }`}
                      >
                        {mess.status}
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
              <p className="text-[13px] text-[#6B7550]">
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
                      className="w-8 h-8 flex items-center justify-center text-[13px] text-[#A09070]"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 flex items-center justify-center rounded-[8px] text-[13px] font-medium border transition-colors ${
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
    </div>
  );
}

import { useEffect, useState } from "react";
import { Search, Building2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "~/redux/store/hooks";
import { fetchAdminMesses } from "~/redux/features/adminSlice";

export default function AdminMessesPage() {
  const dispatch = useAppDispatch();
  const { messes, isLoading } = useAppSelector((s) => s.admin);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchAdminMesses());
  }, [dispatch]);

  const filtered = messes.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.code.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-display font-bold text-[24px] text-[#2C2F1E]">
          Messes
        </h1>
        <p className="text-[14px] text-[#6B7550]">
          {messes.length} registered messes
        </p>
      </div>

      <div className="relative mb-5">
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
      )}
    </div>
  );
}

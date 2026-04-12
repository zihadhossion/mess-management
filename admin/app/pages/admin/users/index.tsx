import { useEffect, useState } from "react";
import { Search, Users } from "lucide-react";
import { Link } from "react-router";
import { useAppDispatch, useAppSelector } from "~/redux/store/hooks";
import { fetchAdminUsers } from "~/redux/features/adminSlice";

export default function AdminUsersPage() {
  const dispatch = useAppDispatch();
  const { users, isLoading } = useAppSelector((s) => s.admin);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchAdminUsers());
  }, [dispatch]);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-[24px] text-[#2C2F1E]">
            Users
          </h1>
          <p className="text-[14px] text-[#6B7550]">
            {users.length} total registered users
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A09070]"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full bg-white border border-[#D9CEB4] rounded-[12px] pl-10 pr-4 py-2.5 text-[14px] text-[#2C2F1E] outline-none focus:border-[#626F47] placeholder:text-[#C0B090]"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#626F47] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users size={32} className="text-[#A09070] mx-auto mb-3" />
          <p className="text-[15px] text-[#6B7550] font-semibold">
            No users found
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#E8E0D0] rounded-[16px] overflow-hidden shadow-[0_2px_8px_rgba(74,60,30,0.06)]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8E0D0] bg-[#FAF7F0]">
                {["Name", "Email", "Role", "Status", "Mess"].map((h) => (
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
              {filtered.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-[#F0EBE0] last:border-b-0 hover:bg-[#FAF7F0]"
                >
                  <td className="px-4 py-3">
                    <Link
                      to={`/users/${user.id}`}
                      className="flex items-center gap-2.5 hover:underline"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#F0BB78] flex items-center justify-center font-bold text-[13px] text-[#2C2F1E] shrink-0">
                        {user.name[0]?.toUpperCase()}
                      </div>
                      <span className="font-semibold text-[14px] text-[#2C2F1E]">
                        {user.name}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#6B7550]">
                    {user.email}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[rgba(98,111,71,0.1)] text-[#626F47] capitalize">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${user.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#6B7550]">
                    {user.messName ?? "—"}
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

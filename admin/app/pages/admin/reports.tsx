import { useState } from "react";
import { FileBarChart, Download, RefreshCw } from "lucide-react";
import { generateReport } from "~/services/httpServices/adminService";
import { getErrorMessage } from "~/utils/errorHandler";
import type { ReportRow, ReportType } from "~/types/admin.d";
import { SelectDropdown } from "~/components/ui/SelectDropdown";

const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: "users", label: "Users" },
  { value: "messes", label: "Messes" },
  { value: "financial", label: "Financial" },
  { value: "engagement", label: "Engagement" },
  { value: "system_usage", label: "System Usage" },
];

function downloadCSV(columns: string[], rows: ReportRow[], filename: string) {
  const header = columns.join(",");
  const body = rows
    .map((row) =>
      columns
        .map((col) => {
          const val = row[col] ?? "";
          const str = String(val);
          return str.includes(",") || str.includes('"')
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        })
        .join(","),
    )
    .join("\n");
  const blob = new Blob([`${header}\n${body}`], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("users");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [generated, setGenerated] = useState(false);

  async function handleGenerate() {
    if (!fromDate || !toDate) {
      setError("Both From Date and To Date are required.");
      return;
    }
    setError(null);
    setIsLoading(true);
    setGenerated(false);
    try {
      const res = await generateReport({ type: reportType, from: fromDate, to: toDate });
      const payload = res.data.data;
      setColumns(payload.columns ?? []);
      setRows(payload.rows ?? []);
      setGenerated(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  function handleDownloadCSV() {
    const label = REPORT_TYPES.find((t) => t.value === reportType)?.label ?? reportType;
    downloadCSV(columns, rows, `${label.toLowerCase()}-report-${fromDate}-${toDate}.csv`);
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-display font-bold text-[26px] text-[#2C2F1E]">
          Custom Reports
        </h1>
        <p className="text-base text-[#6B7550]">
          Generate and download platform reports by type and date range
        </p>
      </div>

      {/* Report Builder */}
      <div className="bg-white border border-[#E8E0D0] rounded-[16px] p-5 mb-6 shadow-[0_2px_8px_rgba(74,60,30,0.06)]">
        <h2 className="font-display font-bold text-[18px] text-[#2C2F1E] mb-4">
          Report Parameters
        </h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-[13px] font-semibold text-[#6B7550] mb-1">
              Report Type <span className="text-red-500">*</span>
            </label>
            <SelectDropdown
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
            >
              {REPORT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </SelectDropdown>
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-[13px] font-semibold text-[#6B7550] mb-1">
              From Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full border border-[#D9CEB4] rounded-[10px] px-3 py-2 text-[15px] text-[#2C2F1E] outline-none focus:border-[#626F47]"
            />
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-[13px] font-semibold text-[#6B7550] mb-1">
              To Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full border border-[#D9CEB4] rounded-[10px] px-3 py-2 text-[15px] text-[#2C2F1E] outline-none focus:border-[#626F47]"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#626F47] text-[#F5ECD5] font-semibold text-[15px] rounded-[10px] disabled:opacity-50 hover:bg-[#515C3A] transition-colors"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            {isLoading ? "Generating..." : "Generate Report"}
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 p-3 bg-red-50 border border-red-200 rounded-[10px] text-[15px] text-red-700"
          >
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {generated && (
        <div className="bg-white border border-[#E8E0D0] rounded-[16px] shadow-[0_2px_8px_rgba(74,60,30,0.06)]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0EBE0]">
            <div>
              <h2 className="font-display font-bold text-[18px] text-[#2C2F1E]">
                {REPORT_TYPES.find((t) => t.value === reportType)?.label} Report
              </h2>
              <p className="text-[13px] text-[#6B7550]">
                {rows.length} row{rows.length !== 1 ? "s" : ""} · {fromDate} to {toDate}
              </p>
            </div>
            <button
              onClick={handleDownloadCSV}
              disabled={rows.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-[#626F47] text-[#F5ECD5] font-semibold text-[14px] rounded-[10px] disabled:opacity-40 hover:bg-[#515C3A] transition-colors"
            >
              <Download size={15} /> Download CSV
            </button>
          </div>

          {rows.length === 0 ? (
            <div className="text-center py-12">
              <FileBarChart size={32} className="text-[#A09070] mx-auto mb-3" />
              <p className="text-[16px] text-[#6B7550] font-semibold">
                No data for the selected period
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-max">
                <thead>
                  <tr className="bg-[#FAF7F0]">
                    {columns.map((col) => (
                      <th
                        key={col}
                        className="px-5 py-3 text-[13px] font-semibold text-[#6B7550] uppercase tracking-wider whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr
                      key={i}
                      className={`border-t border-[#F0EBE0] ${i % 2 === 0 ? "bg-white" : "bg-[#FDFAF5]"}`}
                    >
                      {columns.map((col) => (
                        <td
                          key={col}
                          className="px-5 py-3 text-[15px] text-[#2C2F1E] whitespace-nowrap"
                        >
                          {String(row[col] ?? "—")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!generated && !isLoading && (
        <div className="text-center py-16">
          <FileBarChart size={40} className="text-[#A09070] mx-auto mb-3" />
          <p className="text-[17px] text-[#6B7550] font-semibold">
            Select a report type and date range, then click Generate
          </p>
        </div>
      )}
    </div>
  );
}

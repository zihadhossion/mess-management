import { useEffect, useState } from "react";
import { Settings, Save, Plus, Trash2, Mail, Globe } from "lucide-react";
import {
  getAdminConfig,
  updateAdminConfig,
  getSupportedCurrencies,
  updateSupportedCurrencies,
  getEmailTemplates,
  updateEmailTemplate,
} from "~/services/httpServices/adminService";
import { getErrorMessage } from "~/utils/errorHandler";
import type { AdminConfig, EmailTemplate } from "~/types/admin.d";

const CARD = "bg-white border border-[#E8E0D0] rounded-[16px] p-5 shadow-[0_2px_8px_rgba(74,60,30,0.06)]";

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div
      onClick={onChange}
      className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${checked ? "bg-[#626F47]" : "bg-[#D9CEB4]"}`}
    >
      <div className={`w-5 h-5 bg-white rounded-full m-0.5 transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </div>
  );
}

export default function AdminConfigPage() {
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Currency management
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [currencySaving, setCurrencySaving] = useState(false);
  const [currencyError, setCurrencyError] = useState<string | null>(null);
  const [currencySuccess, setCurrencySuccess] = useState(false);
  const [newCurrency, setNewCurrency] = useState("");

  // Email templates
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [templateSaving, setTemplateSaving] = useState(false);
  const [templateError, setTemplateError] = useState<string | null>(null);
  const [templateSuccess, setTemplateSuccess] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      getAdminConfig().then((r) => setConfig(r.data)).catch(() => {}),
      getSupportedCurrencies().then((r) => setCurrencies(r.data.data ?? [])).catch(() => {}),
      getEmailTemplates().then((r) => setTemplates(r.data.data ?? [])).catch(() => {}),
    ]).finally(() => setIsLoading(false));
  }, []);

  async function handleSave() {
    if (!config) return;
    setError(null);
    setSuccess(false);
    setIsSaving(true);
    try {
      await updateAdminConfig(config);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  function updateConfig<K extends keyof AdminConfig>(key: K, value: AdminConfig[K]) {
    setConfig((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function addCurrency() {
    const code = newCurrency.trim().toUpperCase();
    if (!code || currencies.includes(code)) return;
    setCurrencies((prev) => [...prev, code]);
    setNewCurrency("");
  }

  function removeCurrency(code: string) {
    setCurrencies((prev) => prev.filter((c) => c !== code));
  }

  async function saveCurrencies() {
    setCurrencyError(null);
    setCurrencySuccess(false);
    setCurrencySaving(true);
    try {
      await updateSupportedCurrencies(currencies);
      setCurrencySuccess(true);
      setTimeout(() => setCurrencySuccess(false), 3000);
    } catch (err) {
      setCurrencyError(getErrorMessage(err));
    } finally {
      setCurrencySaving(false);
    }
  }

  async function saveTemplate() {
    if (!editingTemplate) return;
    setTemplateError(null);
    setTemplateSuccess(false);
    setTemplateSaving(true);
    try {
      await updateEmailTemplate(editingTemplate.id, {
        subject: editingTemplate.subject,
        body: editingTemplate.body,
      });
      setTemplates((prev) =>
        prev.map((t) => (t.id === editingTemplate.id ? editingTemplate : t)),
      );
      setTemplateSuccess(true);
      setTimeout(() => { setTemplateSuccess(false); setEditingTemplate(null); }, 2000);
    } catch (err) {
      setTemplateError(getErrorMessage(err));
    } finally {
      setTemplateSaving(false);
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-display font-bold text-[26px] text-[#2C2F1E]">System Configuration</h1>
        <p className="text-base text-[#6B7550]">Platform-wide settings and defaults</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#626F47] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">

          {/* ── General Config ────────────────────────────────────────── */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-[12px] text-[15px] text-red-700">{error}</div>
          )}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-[12px] text-[15px] text-green-700">Configuration saved successfully.</div>
          )}

          {config ? (
            <>
              <div className={CARD}>
                <h2 className="font-display font-bold text-lg text-[#2C2F1E] mb-4">Mess Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#6B7550] uppercase tracking-wider mb-1.5">
                      Max Members Per Mess
                    </label>
                    <input
                      type="number"
                      value={config.maxMembersPerMess}
                      onChange={(e) => updateConfig("maxMembersPerMess", Number(e.target.value))}
                      className="w-full bg-[#FAF7F0] border border-[#D9CEB4] rounded-[10px] px-4 py-2.5 text-base text-[#2C2F1E] outline-none focus:border-[#626F47]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#6B7550] uppercase tracking-wider mb-1.5">
                      Default Meal Rate (৳)
                    </label>
                    <input
                      type="number"
                      value={config.defaultMealRate}
                      onChange={(e) => updateConfig("defaultMealRate", Number(e.target.value))}
                      className="w-full bg-[#FAF7F0] border border-[#D9CEB4] rounded-[10px] px-4 py-2.5 text-base text-[#2C2F1E] outline-none focus:border-[#626F47]"
                    />
                  </div>
                </div>
              </div>

              <div className={CARD}>
                <h2 className="font-display font-bold text-lg text-[#2C2F1E] mb-4">Auth Settings</h2>
                <div className="space-y-3">
                  {(
                    [
                      ["allowSelfRegistration", "Allow Self Registration"],
                      ["requireEmailVerification", "Require Email Verification"],
                    ] as [keyof AdminConfig, string][]
                  ).map(([key, label]) => (
                    <label key={key} className="flex items-center justify-between cursor-pointer">
                      <span className="text-base text-[#2C2F1E] font-medium">{label}</span>
                      <Toggle
                        checked={config[key] as boolean}
                        onChange={() => updateConfig(key, !config[key] as AdminConfig[typeof key])}
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className={CARD}>
                <h2 className="font-display font-bold text-lg text-[#2C2F1E] mb-4">Maintenance</h2>
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-base text-[#2C2F1E] font-medium block">Maintenance Mode</span>
                    <span className="text-sm text-[#A09070]">Disables access for non-admin users</span>
                  </div>
                  <div
                    onClick={() => updateConfig("maintenanceMode", !config.maintenanceMode)}
                    className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${config.maintenanceMode ? "bg-red-500" : "bg-[#D9CEB4]"}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full m-0.5 transition-transform ${config.maintenanceMode ? "translate-x-5" : "translate-x-0"}`} />
                  </div>
                </label>
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 bg-[#626F47] text-[#F5ECD5] font-semibold text-base py-3 rounded-[12px] disabled:opacity-50"
              >
                <Save size={18} />
                {isSaving ? "Saving..." : "Save Configuration"}
              </button>
            </>
          ) : (
            <div className="text-center py-8">
              <Settings size={32} className="text-[#A09070] mx-auto mb-3" />
              <p className="text-[17px] text-[#6B7550] font-semibold">General configuration unavailable</p>
            </div>
          )}

          {/* ── Currency Management ───────────────────────────────────── */}
          <div className={CARD}>
            <div className="flex items-center gap-2 mb-4">
              <Globe size={18} className="text-[#626F47]" />
              <h2 className="font-display font-bold text-lg text-[#2C2F1E]">Currency Management</h2>
            </div>
            <p className="text-[13px] text-[#6B7550] mb-4">Supported currencies available to mess managers when creating a mess.</p>

            {currencyError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-[10px] text-[14px] text-red-700">{currencyError}</div>
            )}
            {currencySuccess && (
              <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-[10px] text-[14px] text-green-700">Currencies updated.</div>
            )}

            <div className="flex flex-wrap gap-2 mb-4 min-h-[36px]">
              {currencies.length === 0 && (
                <span className="text-[13px] text-[#A09070]">No currencies configured</span>
              )}
              {currencies.map((code) => (
                <span key={code} className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F5ECD5] border border-[#D9CEB4] rounded-full text-[14px] font-semibold text-[#2C2F1E]">
                  {code}
                  <button onClick={() => removeCurrency(code)} className="text-[#A09070] hover:text-red-500 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newCurrency}
                onChange={(e) => setNewCurrency(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && addCurrency()}
                placeholder="e.g. USD, EUR, BDT"
                maxLength={5}
                className="flex-1 border border-[#D9CEB4] rounded-[10px] px-3 py-2 text-[14px] text-[#2C2F1E] outline-none focus:border-[#626F47] uppercase"
              />
              <button
                onClick={addCurrency}
                disabled={!newCurrency.trim()}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#626F47] text-white text-[14px] font-semibold rounded-[10px] disabled:opacity-50 hover:bg-[#4d5638] transition-colors"
              >
                <Plus size={15} /> Add
              </button>
              <button
                onClick={saveCurrencies}
                disabled={currencySaving}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-[#D9CEB4] text-[#6B7550] text-[14px] font-semibold rounded-[10px] disabled:opacity-50 hover:bg-[#FAF7F0] transition-colors"
              >
                <Save size={14} /> {currencySaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          {/* ── Email Templates ───────────────────────────────────────── */}
          <div className={CARD}>
            <div className="flex items-center gap-2 mb-4">
              <Mail size={18} className="text-[#626F47]" />
              <h2 className="font-display font-bold text-lg text-[#2C2F1E]">Email Templates</h2>
            </div>

            {templates.length === 0 ? (
              <p className="text-[14px] text-[#A09070] py-4 text-center">No email templates available</p>
            ) : editingTemplate ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[15px] font-semibold text-[#2C2F1E] capitalize">{editingTemplate.type.replace(/_/g, " ")}</span>
                  <button onClick={() => setEditingTemplate(null)} className="text-[13px] text-[#6B7550] hover:text-[#2C2F1E]">
                    Cancel
                  </button>
                </div>
                {templateError && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-[10px] text-[14px] text-red-700">{templateError}</div>
                )}
                {templateSuccess && (
                  <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-[10px] text-[14px] text-green-700">Template saved.</div>
                )}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[13px] font-semibold text-[#6B7550] mb-1">Subject</label>
                    <input
                      type="text"
                      value={editingTemplate.subject}
                      onChange={(e) => setEditingTemplate((t) => t ? { ...t, subject: e.target.value } : t)}
                      className="w-full border border-[#D9CEB4] rounded-[10px] px-3 py-2 text-[14px] text-[#2C2F1E] outline-none focus:border-[#626F47]"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-[#6B7550] mb-1">Body</label>
                    <textarea
                      value={editingTemplate.body}
                      onChange={(e) => setEditingTemplate((t) => t ? { ...t, body: e.target.value } : t)}
                      rows={8}
                      className="w-full border border-[#D9CEB4] rounded-[10px] px-3 py-2 text-[13px] text-[#2C2F1E] outline-none focus:border-[#626F47] resize-y font-mono"
                    />
                  </div>
                  <button
                    onClick={saveTemplate}
                    disabled={templateSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-[#626F47] text-white text-[14px] font-semibold rounded-[10px] disabled:opacity-50 hover:bg-[#4d5638] transition-colors"
                  >
                    <Save size={14} /> {templateSaving ? "Saving..." : "Save Template"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {templates.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-3 bg-[#FAF7F0] border border-[#E8E0D0] rounded-[10px]">
                    <div>
                      <div className="text-[15px] font-semibold text-[#2C2F1E] capitalize">{t.type.replace(/_/g, " ")}</div>
                      <div className="text-[13px] text-[#6B7550] truncate max-w-[280px]">{t.subject}</div>
                    </div>
                    <button
                      onClick={() => setEditingTemplate(t)}
                      className="text-[13px] font-semibold text-[#626F47] hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

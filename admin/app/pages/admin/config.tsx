import { useEffect, useState } from "react";
import { Settings, Save } from "lucide-react";
import {
  getAdminConfig,
  updateAdminConfig,
} from "~/services/httpServices/adminService";
import { getErrorMessage } from "~/utils/errorHandler";
import type { AdminConfig } from "~/types/admin.d";

export default function AdminConfigPage() {
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    getAdminConfig()
      .then((res) => setConfig(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false));
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

  function updateConfig<K extends keyof AdminConfig>(
    key: K,
    value: AdminConfig[K],
  ) {
    setConfig((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-display font-bold text-[24px] text-[#2C2F1E]">
          System Configuration
        </h1>
        <p className="text-[14px] text-[#6B7550]">
          Platform-wide settings and defaults
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-[12px] text-[13px] text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-[12px] text-[13px] text-green-700">
          Configuration saved successfully.
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#626F47] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !config ? (
        <div className="text-center py-16">
          <Settings size={32} className="text-[#A09070] mx-auto mb-3" />
          <p className="text-[15px] text-[#6B7550] font-semibold">
            Configuration unavailable
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white border border-[#E8E0D0] rounded-[16px] p-5 shadow-[0_2px_8px_rgba(74,60,30,0.06)]">
            <h2 className="font-display font-bold text-[16px] text-[#2C2F1E] mb-4">
              Mess Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-[#6B7550] uppercase tracking-wider mb-1.5">
                  Max Members Per Mess
                </label>
                <input
                  type="number"
                  value={config.maxMembersPerMess}
                  onChange={(e) =>
                    updateConfig("maxMembersPerMess", Number(e.target.value))
                  }
                  className="w-full bg-[#FAF7F0] border border-[#D9CEB4] rounded-[10px] px-4 py-2.5 text-[14px] text-[#2C2F1E] outline-none focus:border-[#626F47]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#6B7550] uppercase tracking-wider mb-1.5">
                  Default Meal Rate (৳)
                </label>
                <input
                  type="number"
                  value={config.defaultMealRate}
                  onChange={(e) =>
                    updateConfig("defaultMealRate", Number(e.target.value))
                  }
                  className="w-full bg-[#FAF7F0] border border-[#D9CEB4] rounded-[10px] px-4 py-2.5 text-[14px] text-[#2C2F1E] outline-none focus:border-[#626F47]"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E8E0D0] rounded-[16px] p-5 shadow-[0_2px_8px_rgba(74,60,30,0.06)]">
            <h2 className="font-display font-bold text-[16px] text-[#2C2F1E] mb-4">
              Auth Settings
            </h2>
            <div className="space-y-3">
              {(
                [
                  ["allowSelfRegistration", "Allow Self Registration"],
                  ["requireEmailVerification", "Require Email Verification"],
                ] as [keyof AdminConfig, string][]
              ).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <span className="text-[14px] text-[#2C2F1E] font-medium">
                    {label}
                  </span>
                  <div
                    onClick={() =>
                      updateConfig(key, !config[key] as AdminConfig[typeof key])
                    }
                    className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${
                      config[key] ? "bg-[#626F47]" : "bg-[#D9CEB4]"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full m-0.5 transition-transform ${
                        config[key] ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#E8E0D0] rounded-[16px] p-5 shadow-[0_2px_8px_rgba(74,60,30,0.06)]">
            <h2 className="font-display font-bold text-[16px] text-[#2C2F1E] mb-4">
              Maintenance
            </h2>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-[14px] text-[#2C2F1E] font-medium block">
                  Maintenance Mode
                </span>
                <span className="text-[12px] text-[#A09070]">
                  Disables access for non-admin users
                </span>
              </div>
              <div
                onClick={() =>
                  updateConfig("maintenanceMode", !config.maintenanceMode)
                }
                className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${
                  config.maintenanceMode ? "bg-red-500" : "bg-[#D9CEB4]"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full m-0.5 transition-transform ${
                    config.maintenanceMode ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
            </label>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 bg-[#626F47] text-[#F5ECD5] font-semibold text-[14px] py-3 rounded-[12px] disabled:opacity-50"
          >
            <Save size={18} />
            {isSaving ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      )}
    </div>
  );
}

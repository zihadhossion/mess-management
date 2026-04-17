import { Clock, RefreshCw } from "lucide-react";
import { Link } from "react-router";

export default function MessCreationPendingPage() {
  return (
    <div className="min-h-screen bg-[#F5ECD5] flex items-center justify-center px-4">
      <div className="text-center max-w-sm w-full">
        <div className="w-20 h-20 bg-[#F0BB78] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_8px_32px_rgba(240,187,120,0.4)]">
          <Clock size={36} className="text-[#2C2F1E]" />
        </div>
        <h1 className="font-display font-bold text-[26px] text-[#2C2F1E] mb-3">
          Request Submitted!
        </h1>
        <p className="text-[14px] text-[#6B7550] mb-2">
          Your mess creation request is under review. The admin will approve or
          reject it within 24–48 hours.
        </p>
        <p className="text-[13px] text-[#A09070] mb-8">
          You'll receive a notification once a decision is made.
        </p>

        <div className="bg-[#FBF5E8] border border-[#D9CEB4] rounded-[16px] p-5 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-[#6B7550]">Status</span>
            <span className="flex items-center gap-1.5 text-[13px] font-semibold text-[#F0BB78] bg-[rgba(240,187,120,0.15)] px-3 py-1 rounded-full">
              <Clock size={12} /> Pending Review
            </span>
          </div>
        </div>

        <Link
          to="/onboarding/role-selection"
          className="flex items-center justify-center gap-2 w-full bg-[#626F47] text-[#F5ECD5] font-bold text-[15px] py-[13px] rounded-[12px]"
        >
          <RefreshCw size={18} /> Check Status Later
        </Link>
      </div>
    </div>
  );
}

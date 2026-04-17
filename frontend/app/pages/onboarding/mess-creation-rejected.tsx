import { XCircle, RefreshCcw } from "lucide-react";
import { Link } from "react-router";
import { useAppSelector } from "~/redux/store/hooks";

export default function MessCreationRejectedPage() {
  const creationRequest = useAppSelector((s) => s.mess.creationRequest);

  return (
    <div className="min-h-screen bg-[#F5ECD5] flex items-center justify-center px-4">
      <div className="text-center max-w-sm w-full">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={40} className="text-red-500" />
        </div>
        <h1 className="font-display font-bold text-[26px] text-[#2C2F1E] mb-3">
          Request Rejected
        </h1>
        <p className="text-[14px] text-[#6B7550] mb-6">
          Your mess creation request was not approved.
        </p>

        {creationRequest?.reviewNote && (
          <div className="bg-red-50 border border-red-200 rounded-[16px] p-4 mb-6 text-left">
            <p className="text-[11px] font-semibold text-red-700 uppercase tracking-wider mb-1">
              Rejection Reason
            </p>
            <p className="text-[13px] text-red-700">
              {creationRequest.reviewNote}
            </p>
          </div>
        )}

        <Link
          to="/onboarding/mess-creation"
          className="flex items-center justify-center gap-2 w-full bg-[#626F47] text-[#F5ECD5] font-bold text-[15px] py-[13px] rounded-[12px]"
        >
          <RefreshCcw size={18} /> Resubmit Request
        </Link>
      </div>
    </div>
  );
}

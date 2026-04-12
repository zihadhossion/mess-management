import { Link } from "react-router";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0EBE0]">
      <div className="text-center">
        <div className="font-display font-bold text-[80px] text-[#626F47] leading-none mb-4">
          404
        </div>
        <h1 className="font-display font-bold text-[24px] text-[#2C2F1E] mb-2">
          Page not found
        </h1>
        <p className="text-[14px] text-[#6B7550] mb-6">
          The page you are looking for does not exist.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 bg-[#626F47] text-[#F5ECD5] font-semibold text-[14px] px-6 py-3 rounded-[12px] hover:bg-[#4d5638] transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

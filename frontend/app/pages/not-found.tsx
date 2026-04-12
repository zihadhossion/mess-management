import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5ECD5] text-center px-6">
      <div className="w-20 h-20 bg-[#F0BB78] rounded-[22px] flex items-center justify-center mb-6 shadow-[0_8px_32px_rgba(240,187,120,0.5)]">
        <span className="text-[36px] font-bold font-display text-[#2C2F1E]">
          4
        </span>
      </div>
      <h1 className="text-[32px] font-bold font-display text-[#2C2F1E] mb-2">
        404
      </h1>
      <p className="text-[14px] text-[#6B7550] mb-8">
        The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-[#626F47] text-[#F5ECD5] rounded-[12px] font-semibold text-[14px] hover:bg-[#4d5638] transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}

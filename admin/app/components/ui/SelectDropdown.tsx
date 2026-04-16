import { ChevronDown } from "lucide-react";
import { cn } from "~/lib/utils";

interface SelectDropdownProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

export function SelectDropdown({ className, children, ...props }: SelectDropdownProps) {
  return (
    <div className="relative">
      <select
        className={cn(
          "appearance-none bg-white border border-[#D9CEB4] rounded-[12px] pl-3 pr-8 py-2.5 text-base text-[#2C2F1E] outline-none focus:border-[#626F47] cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A09070] pointer-events-none"
      />
    </div>
  );
}

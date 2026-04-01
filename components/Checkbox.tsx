import { CheckboxProps } from "@/lib/types/charts";

export const Checkbox = ({ checked, onChange }: CheckboxProps) => (
  <span
    onClick={(e) => {
      e.stopPropagation();
      onChange();
    }}
    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer shrink-0 transition-colors ${
      checked ? "bg-[#6860C8] border-[#6860C8]" : "bg-white border-gray-300"
    }`}
  >
    {checked && (
      <svg width="11" height="9" viewBox="0 0 11 9">
        <path
          d="M1 4.5L4 7.5L10 1"
          stroke="#fff"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
  </span>
);

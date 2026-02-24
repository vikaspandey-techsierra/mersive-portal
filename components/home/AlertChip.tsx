import Image from "next/image";

const AlertChip = ({
  icon,
  label,
  value,
  className = "text-gray",
}: {
  icon: string;
  label: string;
  value: number;
  iconColor?: string;
  className?: string;
}) => {
  return (
    <div
      className={`flex items-center gap-0 bg-white border border-gray-200 rounded-lg px-4 py-2.5 ${className} h-11`}
    >
      <div className="flex items-center justify-center gap-2">
        <Image src={icon} width={24} height={24} alt={`${label} icon`} />
        <span className="text-[13px] text-[#090814] whitespace-nowrap">
          {label}
        </span>
      </div>
      <span className={`text-[24px] text-[#871903] font-semibold ml-1`}>
        {value}
      </span>
    </div>
  );
};

export default AlertChip;

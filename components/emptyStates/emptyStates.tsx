"use client";

import { EmptyStateProps } from "@/lib/types/charts";
import Image from "next/image";

const EmptyState = ({
  icon,
  title,
  description,
  className = "",
}: EmptyStateProps) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center w-full h-full py-20 ${className}`}
    >
      <div className="">
        {icon && (
          <Image src={icon} alt="empty state icon" width={48} height={48} />
        )}
      </div>
      {title && (
        <div className="text-[24px] font-medium text-[#090814] my-8">
          {title}
        </div>
      )}
      {description && (
        <div className="text-[13px] text-[#93949C] max-w-80 leading-snug">
          {description}
        </div>
      )}
    </div>
  );
};

export default EmptyState;

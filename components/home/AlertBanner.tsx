import { AdminAlert } from "@/lib/types/api";
import Image from "next/image";
import TvOffIcon from "@/components/icons/tv_off.svg";
import CalendarIcon from "@/components/icons/event_busy.svg";
import AlertChip from "./AlertChip";
import ErrorIcon from "@/components/icons/error.svg";

const AlertBanner = ({ alert }: { alert: AdminAlert }) => {
  const hasAlerts = alert.offlineDevices || alert.expiredOrExpiringSoon;

  if (!hasAlerts) return null;
  return (
    <div className=" px-8 py-4 flex items-center gap-2 bg-[#F3D9D7] justify-between ">
      {/* Left: title */}
      <div className="flex items-center gap-2 text-[#090814]">
        <div>
          <Image src={ErrorIcon} width={34} height={34} alt="Alert icon" />
        </div>
        <div>
          <div className="text-[20px] font-semibold text-500 leading-tight">
            Requires admin attention
          </div>
          <div className="text-[13px] leading-tight">
            Click to filter devices
          </div>
        </div>
      </div>

      {/* Chips */}
      <div className="flex w-[74%] gap-8  flex-wrap">
        <AlertChip
          icon={TvOffIcon}
          label="Offline devices"
          value={alert.offlineDevices}
        />
        <AlertChip
          icon={CalendarIcon}
          label="Expired or expiring soon"
          value={alert.expiredOrExpiringSoon}
        />
      </div>
    </div>
  );
};

export default AlertBanner;

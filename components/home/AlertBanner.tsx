import { AdminAlert } from "@/lib/types/api";
import Image from "next/image";
import TvOffIcon from "@/components/icons/tv_off.svg";
import CalendarIcon from "@/components/icons/event_busy.svg";
import DownloadIcon from "@/components/icons/outdated_firmware.svg";
import AlertTriangleIcon from "@/components/icons/warning.svg";
import AlertChip from "./AlertChip";
import ErrorIcon from "@/components/icons/error.svg";

const AlertBanner = ({ alert }: { alert: AdminAlert }) => {
  return (
    <div className=" px-8 py-4 flex items-center gap-3 bg-[#F3D9D7] justify-between ">
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
      <div className="flex w-[70%] gap-2 justify-between flex-wrap">
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
        <AlertChip
          icon={DownloadIcon}
          label="Outdated firmware"
          value={alert.outdatedFirmware}
        />
        <AlertChip
          icon={AlertTriangleIcon}
          label="Other issues"
          value={alert.otherIssues}
        />
      </div>
    </div>
  );
};

export default AlertBanner;

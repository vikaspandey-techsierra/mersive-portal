import { DashboardStats } from "@/lib/types/api";
import MonitorIcon from "@/components/icons/tv.svg";
import UserIcon from "@/components/icons/person.svg";
import ClockIcon from "@/components/icons/schedule.svg";
import TrendingUpIcon from "@/components/icons/trending_up.svg";
import Image from "next/image";

const StatCards = ({ stats }: { stats: DashboardStats }) => {
  const cards = [
    {
      icon: MonitorIcon,
      label: "Meetings underway",
      value: String(stats.meetingsUnderway),
    },
    {
      icon: UserIcon,
      label: "Unique users",
      value: String(stats.uniqueUsers),
    },
    {
      icon: ClockIcon,
      label: "Average meeting length",
      value: `${stats.avgMeetingLengthMin} min`,
    },
    {
      icon: TrendingUpIcon,
      label: "Busiest time",
      value: stats.busiestTimeLabel,
    },
  ];

  return (
    <div className=" flex max-lg:grid grid-cols-2  justify-around gap-6  overflow-hidden  text-[#090814] font-poppins px-8">
      {cards.map((card, i) => (
        <div
          key={i}
          className="p-5 flex flex-col  justify-center gap-3 px-4 py-6 border border-gray-200 rounded-lg w-full h-40"
        >
          <div className="flex items-center gap-2.5">
            <div className="max-md:w-8 max-md:h-8 w-11 h-11 rounded-lg flex items-center justify-center text-white bg-[#5E54C5] ">
             <Image src={card.icon} alt={`${card.label} icon`} width={20} height={20} />
            </div>
          </div>
          <div className="text-[13px] ">{card.label}</div>
          <div className="max-md:text-[34px] text-5xl font-semibold leading-none">
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatCards;

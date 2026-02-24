interface Props {
  meetingsUnderway: number;
  uniqueUsers: number;
  avgMeetingLengthMinutes: number;
  busiestTime: string;
}

export default function SummaryCards({
  meetingsUnderway,
  uniqueUsers,
  avgMeetingLengthMinutes,
  busiestTime,
}: Props) {
  const cards = [
    {
      title: "Meetings underway",
      value: meetingsUnderway,
    },
    {
      title: "Unique users",
      value: uniqueUsers,
    },
    {
      title: "Average meeting length",
      value: `${avgMeetingLengthMinutes} min`,
    },
    {
      title: "Busiest time",
      value: busiestTime,
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white border rounded-xl p-5 shadow-sm">
          <div className="text-sm text-gray-500">{card.title}</div>

          <div className="text-2xl font-bold mt-1">{card.value}</div>
        </div>
      ))}
    </div>
  );
}

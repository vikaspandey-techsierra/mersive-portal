export const LegendPill = ({
  label,
  color,
}: {
  label: string;
  color: string;
}) => (
  <div
    className="inline-flex items-center text-white rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap"
    style={{ background: color }}
  >
    {label}
  </div>
);

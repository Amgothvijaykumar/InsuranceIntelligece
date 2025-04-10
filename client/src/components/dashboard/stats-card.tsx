interface StatsCardProps {
  title: string;
  value: string;
  trend: string;
  trendLabel: string;
  positive: boolean;
}

export default function StatsCard({
  title,
  value,
  trend,
  trendLabel,
  positive
}: StatsCardProps) {
  return (
    <div className="px-4 py-2">
      <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
      <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
      <p className={`mt-1 text-sm ${positive ? 'text-green-600' : 'text-red-600'}`}>
        <span className="font-medium">{trend}</span>
        <span className="text-gray-500 ml-1">{trendLabel}</span>
      </p>
    </div>
  );
}

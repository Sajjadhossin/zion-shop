export function BarChart({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  const peak = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex h-40 items-end gap-[3px]">
      {data.map((d, i) => (
        <div
          key={i}
          title={`${d.label}: ${d.value}`}
          className="flex-1 rounded-t bg-brand-500/80 transition-colors hover:bg-brand-600"
          style={{ height: `${Math.max(2, (d.value / peak) * 100)}%` }}
        />
      ))}
    </div>
  );
}

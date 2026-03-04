const statusColors: Record<string, string> = {
  accepted: "bg-green-100 text-green-800",
  proposed: "bg-yellow-100 text-yellow-800",
  rejected: "bg-red-100 text-red-800",
  deprecated: "bg-gray-100 text-gray-800",
  superseded: "bg-purple-100 text-purple-800",
};

export function StatusBadge({ status }: { status: string }) {
  const color = statusColors[status] ?? "bg-gray-100 text-gray-700";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {status}
    </span>
  );
}

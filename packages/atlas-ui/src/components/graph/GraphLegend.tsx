const items = [
  { label: "Supersedes", color: "#dc2626", style: "solid" },
  { label: "Depends on", color: "#2563eb", style: "dashed" },
  { label: "Relates to", color: "#6b7280", style: "dotted" },
  { label: "Conflicts with", color: "#ea580c", style: "solid" },
];

const statusItems = [
  { label: "Accepted", color: "bg-green-400" },
  { label: "Proposed", color: "bg-yellow-400" },
  { label: "Rejected", color: "bg-red-400" },
  { label: "Deprecated", color: "bg-gray-400" },
  { label: "Superseded", color: "bg-purple-400" },
];

export function GraphLegend() {
  return (
    <div className="absolute right-4 bottom-4 z-10 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <div className="mb-2 text-xs font-semibold text-gray-500 uppercase">Edges</div>
      <div className="space-y-1">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <svg width="24" height="8">
              <line
                x1="0" y1="4" x2="24" y2="4"
                stroke={item.color}
                strokeWidth={2}
                strokeDasharray={item.style === "dashed" ? "6 3" : item.style === "dotted" ? "2 2" : undefined}
              />
            </svg>
            <span className="text-xs text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 mb-2 text-xs font-semibold text-gray-500 uppercase">Status</div>
      <div className="space-y-1">
        {statusItems.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${item.color}`} />
            <span className="text-xs text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

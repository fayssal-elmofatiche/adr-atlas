import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useNavigate } from "react-router-dom";
import type { AdrNodeData } from "./use-graph-layout";

const statusColors: Record<string, string> = {
  accepted: "border-green-400 bg-green-50",
  proposed: "border-yellow-400 bg-yellow-50",
  rejected: "border-red-400 bg-red-50",
  deprecated: "border-gray-400 bg-gray-100",
  superseded: "border-purple-400 bg-purple-50",
};

export function AdrNode({ id, data }: NodeProps) {
  const navigate = useNavigate();
  const nodeData = data as unknown as AdrNodeData;
  const color = statusColors[nodeData.status] ?? "border-gray-300 bg-white";

  return (
    <div
      onClick={() => navigate(`/adrs/${id}`)}
      className={`cursor-pointer rounded-lg border-2 px-3 py-2 shadow-sm transition-shadow hover:shadow-md ${color}`}
      style={{ minWidth: 180 }}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />
      <div className="truncate text-sm font-medium text-gray-900">{nodeData.label}</div>
      <div className="text-xs text-gray-500">{nodeData.status}</div>
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  );
}

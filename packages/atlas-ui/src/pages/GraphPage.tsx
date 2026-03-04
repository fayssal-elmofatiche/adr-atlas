import { useState, useCallback, useMemo } from "react";
import { ReactFlow, Background, Controls, type NodeTypes } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useGraph } from "../hooks/use-graph";
import { useGraphLayout } from "../components/graph/use-graph-layout";
import { AdrNode } from "../components/graph/AdrNode";
import { GraphLegend } from "../components/graph/GraphLegend";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { ErrorState } from "../components/ui/ErrorState";
import { EmptyState } from "../components/ui/EmptyState";
import type { AdrFilter } from "../api/types";

const nodeTypes: NodeTypes = { adrNode: AdrNode };

export function GraphPage() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const filters: AdrFilter | undefined = useMemo(
    () => statusFilter ? { status: statusFilter } : undefined,
    [statusFilter],
  );

  const { data, isLoading, error } = useGraph(filters);
  const { nodes, edges } = useGraphLayout(data);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error.message} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Decision Graph</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-sm"
        >
          <option value="">All statuses</option>
          <option value="accepted">Accepted</option>
          <option value="proposed">Proposed</option>
          <option value="rejected">Rejected</option>
          <option value="deprecated">Deprecated</option>
          <option value="superseded">Superseded</option>
        </select>
      </div>

      {nodes.length === 0 ? (
        <EmptyState message="No graph data available" />
      ) : (
        <div className="relative h-[calc(100vh-200px)] rounded-lg border border-gray-200 bg-white">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.2}
            maxZoom={2}
          >
            <Background />
            <Controls />
          </ReactFlow>
          <GraphLegend />
        </div>
      )}
    </div>
  );
}

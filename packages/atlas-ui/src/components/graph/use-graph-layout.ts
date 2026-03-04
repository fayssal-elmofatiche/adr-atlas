import { useMemo } from "react";
import dagre from "@dagrejs/dagre";
import type { GraphData } from "../../api/types";
import type { Node, Edge } from "@xyflow/react";

const NODE_WIDTH = 200;
const NODE_HEIGHT = 60;

export interface AdrNodeData {
  label: string;
  status: string;
  connectionCount: number;
  [key: string]: unknown;
}

const edgeColors: Record<string, string> = {
  supersedes: "#dc2626",
  depends_on: "#2563eb",
  relates_to: "#6b7280",
  conflicts_with: "#ea580c",
};

const edgeStyles: Record<string, string> = {
  supersedes: "solid",
  depends_on: "dashed",
  relates_to: "dotted",
  conflicts_with: "solid",
};

export function useGraphLayout(data: GraphData | undefined) {
  return useMemo(() => {
    if (!data) return { nodes: [], edges: [] };

    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: "TB", nodesep: 60, ranksep: 80 });

    for (const node of data.nodes) {
      g.setNode(String(node.id), { width: NODE_WIDTH, height: NODE_HEIGHT });
    }
    for (const edge of data.edges) {
      g.setEdge(String(edge.source), String(edge.target));
    }

    dagre.layout(g);

    const nodes: Node<AdrNodeData>[] = data.nodes.map((n) => {
      const pos = g.node(String(n.id));
      return {
        id: String(n.id),
        type: "adrNode",
        position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 },
        data: { label: n.title, status: n.status, connectionCount: n.connectionCount },
      };
    });

    const edges: Edge[] = data.edges.map((e) => ({
      id: String(e.id),
      source: String(e.source),
      target: String(e.target),
      label: e.type.replace(/_/g, " "),
      style: {
        stroke: edgeColors[e.type] ?? "#6b7280",
        strokeDasharray: edgeStyles[e.type] === "dashed" ? "6 3" : edgeStyles[e.type] === "dotted" ? "2 2" : undefined,
      },
      markerEnd: { type: "arrowclosed" as const, color: edgeColors[e.type] ?? "#6b7280" },
    }));

    return { nodes, edges };
  }, [data]);
}

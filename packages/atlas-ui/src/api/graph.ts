import { apiFetch } from "./client";
import type { GraphData, AdrFilter } from "./types";

export function fetchGraph(filters?: AdrFilter): Promise<GraphData> {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.tag) params.set("tag", filters.tag);
  if (filters?.component) params.set("component", filters.component);
  const qs = params.toString();
  return apiFetch(`/graph${qs ? `?${qs}` : ""}`);
}

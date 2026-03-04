import { apiFetch } from "./client";
import type { AdrListItem, AdrDetail, AdrFilter } from "./types";

export function fetchAdrs(filters?: AdrFilter): Promise<AdrListItem[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.tag) params.set("tag", filters.tag);
  if (filters?.component) params.set("component", filters.component);
  const qs = params.toString();
  return apiFetch(`/adrs${qs ? `?${qs}` : ""}`);
}

export function fetchAdr(id: number): Promise<AdrDetail> {
  return apiFetch(`/adrs/${id}`);
}

export function searchAdrs(query: string): Promise<AdrListItem[]> {
  return apiFetch(`/adrs/search?q=${encodeURIComponent(query)}`);
}

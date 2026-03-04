import { apiFetch } from "./client";
import type { Component, AdrListItem } from "./types";

export function fetchComponents(): Promise<Component[]> {
  return apiFetch("/components");
}

export function fetchComponentAdrs(name: string): Promise<AdrListItem[]> {
  return apiFetch(`/components/${encodeURIComponent(name)}/adrs`);
}

import { apiFetch } from "./client";
import type { Repository } from "./types";

export function fetchRepositories(): Promise<Repository[]> {
  return apiFetch("/repositories");
}

export function addRepository(source: string, scanPaths?: string[]): Promise<Repository> {
  return apiFetch("/repositories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source, scanPaths }),
  });
}

export function syncRepository(id: number): Promise<void> {
  return apiFetch(`/repositories/${id}/sync`, { method: "POST" });
}

export function deleteRepository(id: number): Promise<void> {
  return apiFetch(`/repositories/${id}`, { method: "DELETE" });
}

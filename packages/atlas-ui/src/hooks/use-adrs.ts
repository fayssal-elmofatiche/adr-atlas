import { useQuery } from "@tanstack/react-query";
import { fetchAdrs, fetchAdr, searchAdrs } from "../api/adrs";
import type { AdrFilter } from "../api/types";

export function useAdrs(filters?: AdrFilter) {
  return useQuery({
    queryKey: ["adrs", filters],
    queryFn: () => fetchAdrs(filters),
  });
}

export function useAdr(id: number) {
  return useQuery({
    queryKey: ["adr", id],
    queryFn: () => fetchAdr(id),
  });
}

export function useSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => searchAdrs(query),
    enabled: query.length > 0,
  });
}

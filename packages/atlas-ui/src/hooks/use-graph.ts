import { useQuery } from "@tanstack/react-query";
import { fetchGraph } from "../api/graph";
import type { AdrFilter } from "../api/types";

export function useGraph(filters?: AdrFilter) {
  return useQuery({
    queryKey: ["graph", filters],
    queryFn: () => fetchGraph(filters),
  });
}

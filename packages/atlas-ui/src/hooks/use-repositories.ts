import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchRepositories,
  addRepository,
  syncRepository,
  deleteRepository,
} from "../api/repositories";

export function useRepositories() {
  return useQuery({
    queryKey: ["repositories"],
    queryFn: fetchRepositories,
    refetchInterval: 5000,
  });
}

export function useAddRepository() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ source, scanPaths }: { source: string; scanPaths?: string[] }) =>
      addRepository(source, scanPaths),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["repositories"] });
    },
  });
}

export function useSyncRepository() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => syncRepository(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["repositories"] });
    },
  });
}

export function useDeleteRepository() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteRepository(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["repositories"] });
      qc.invalidateQueries({ queryKey: ["adrs"] });
      qc.invalidateQueries({ queryKey: ["graph"] });
    },
  });
}

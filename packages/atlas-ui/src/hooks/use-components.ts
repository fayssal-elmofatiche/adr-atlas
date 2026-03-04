import { useQuery } from "@tanstack/react-query";
import { fetchComponents, fetchComponentAdrs } from "../api/components";

export function useComponents() {
  return useQuery({
    queryKey: ["components"],
    queryFn: fetchComponents,
  });
}

export function useComponentAdrs(name: string) {
  return useQuery({
    queryKey: ["component-adrs", name],
    queryFn: () => fetchComponentAdrs(name),
    enabled: name.length > 0,
  });
}

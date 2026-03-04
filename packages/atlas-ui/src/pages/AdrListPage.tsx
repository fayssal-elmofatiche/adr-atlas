import { useState, useMemo } from "react";
import { useAdrs } from "../hooks/use-adrs";
import { AdrTable } from "../components/adr/AdrTable";
import { AdrFilters } from "../components/adr/AdrFilters";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { ErrorState } from "../components/ui/ErrorState";
import { EmptyState } from "../components/ui/EmptyState";
import type { AdrFilter } from "../api/types";

export function AdrListPage() {
  const [filters, setFilters] = useState<AdrFilter>({});
  const { data: adrs, isLoading, error } = useAdrs(filters);

  const { statuses, tags, components } = useMemo(() => {
    if (!adrs) return { statuses: [], tags: [], components: [] };
    const s = [...new Set(adrs.map((a) => a.status))].sort();
    const t = [...new Set(adrs.flatMap((a) => a.tags))].sort();
    const c = [...new Set(adrs.flatMap((a) => a.components))].sort();
    return { statuses: s, tags: t, components: c };
  }, [adrs]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error.message} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Architecture Decision Records</h1>
        <span className="text-sm text-gray-500">{adrs?.length ?? 0} ADRs</span>
      </div>
      <AdrFilters filters={filters} onChange={setFilters} statuses={statuses} tags={tags} components={components} />
      {adrs && adrs.length > 0 ? <AdrTable adrs={adrs} /> : <EmptyState message="No ADRs found" />}
    </div>
  );
}

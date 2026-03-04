import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAdrs } from "../hooks/use-adrs";
import { useRepositories } from "../hooks/use-repositories";
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
      {adrs && adrs.length > 0 ? <AdrTable adrs={adrs} /> : <OnboardingOrEmpty />}
    </div>
  );
}

function OnboardingOrEmpty() {
  const { data: repos } = useRepositories();
  const hasRepos = repos && repos.length > 0;

  if (hasRepos) {
    return <EmptyState message="No ADRs match your filters." />;
  }

  return (
    <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
      <h2 className="text-lg font-medium text-gray-900">Welcome to ADR Atlas</h2>
      <p className="mt-2 text-sm text-gray-500">
        Get started by adding a repository source to ingest ADRs from.
      </p>
      <Link
        to="/sources"
        className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Add Source
      </Link>
    </div>
  );
}

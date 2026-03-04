import { useSearchParams } from "react-router-dom";
import { useSearch } from "../hooks/use-adrs";
import { AdrTable } from "../components/adr/AdrTable";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { ErrorState } from "../components/ui/ErrorState";
import { EmptyState } from "../components/ui/EmptyState";

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const { data: results, isLoading, error } = useSearch(query);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error.message} />;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">
        Search results for "{query}"
      </h1>
      {results && results.length > 0 ? (
        <AdrTable adrs={results} />
      ) : (
        <EmptyState message={`No results for "${query}"`} />
      )}
    </div>
  );
}

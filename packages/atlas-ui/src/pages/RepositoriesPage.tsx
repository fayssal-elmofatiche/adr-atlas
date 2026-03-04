import { useState } from "react";
import {
  useRepositories,
  useAddRepository,
  useSyncRepository,
  useDeleteRepository,
} from "../hooks/use-repositories";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { ErrorState } from "../components/ui/ErrorState";
import type { Repository } from "../api/types";

const statusStyles: Record<string, string> = {
  pending: "bg-gray-100 text-gray-800",
  syncing: "bg-blue-100 text-blue-800",
  ready: "bg-green-100 text-green-800",
  error: "bg-red-100 text-red-800",
};

function RepoStatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] ?? "bg-gray-100 text-gray-700";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {status === "syncing" && (
        <span className="mr-1 inline-block h-3 w-3 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
      )}
      {status}
    </span>
  );
}

function AddRepositoryForm() {
  const [source, setSource] = useState("");
  const addRepo = useAddRepository();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = source.trim();
    if (!trimmed) return;
    addRepo.mutate({ source: trimmed });
    setSource("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <input
        type="text"
        value={source}
        onChange={(e) => setSource(e.target.value)}
        placeholder="https://github.com/org/repo or /path/to/local/repo"
        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={!source.trim() || addRepo.isPending}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {addRepo.isPending ? "Adding..." : "Add Source"}
      </button>
    </form>
  );
}

function RepositoryRow({ repo }: { repo: Repository }) {
  const syncRepo = useSyncRepository();
  const deleteRepo = useDeleteRepository();
  const isBusy = repo.status === "syncing" || repo.status === "pending";

  return (
    <tr className="border-t border-gray-200">
      <td className="px-4 py-3">
        <div className="font-medium text-gray-900">{repo.slug}</div>
        <div className="text-xs text-gray-500">
          {repo.sourceUrl ?? repo.localPath}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${repo.sourceType === "git" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"}`}>
          {repo.sourceType}
        </span>
      </td>
      <td className="px-4 py-3">
        <RepoStatusBadge status={repo.status} />
        {repo.status === "error" && repo.errorMessage && (
          <div className="mt-1 text-xs text-red-600" title={repo.errorMessage}>
            {repo.errorMessage.length > 60
              ? repo.errorMessage.slice(0, 60) + "..."
              : repo.errorMessage}
          </div>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700">{repo.adrCount}</td>
      <td className="px-4 py-3 text-xs text-gray-500">
        {repo.lastSyncedAt
          ? new Date(repo.lastSyncedAt).toLocaleString()
          : "Never"}
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <button
            onClick={() => syncRepo.mutate(repo.id)}
            disabled={isBusy}
            className="rounded px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50"
          >
            Sync
          </button>
          <button
            onClick={() => {
              if (confirm(`Remove "${repo.slug}" and all its ADRs?`)) {
                deleteRepo.mutate(repo.id);
              }
            }}
            disabled={isBusy}
            className="rounded px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      </td>
    </tr>
  );
}

export function RepositoriesPage() {
  const { data: repos, isLoading, error } = useRepositories();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error.message} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Sources</h1>
        <p className="mt-1 text-sm text-gray-500">
          Add git repositories or local directories to ingest ADRs from.
        </p>
      </div>

      <AddRepositoryForm />

      {repos && repos.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Repository</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">ADRs</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Last Synced</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {repos.map((repo) => (
                <RepositoryRow key={repo.id} repo={repo} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
          <p className="text-sm text-gray-500">
            No sources added yet. Enter a git URL or local path above to get started.
          </p>
        </div>
      )}
    </div>
  );
}

import { useParams, Link } from "react-router-dom";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAdr } from "../hooks/use-adrs";
import { StatusBadge } from "../components/ui/StatusBadge";
import { TagChip } from "../components/ui/TagChip";
import { RelationshipPanel } from "../components/adr/RelationshipPanel";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { ErrorState } from "../components/ui/ErrorState";

export function AdrDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: adr, isLoading, error } = useAdr(Number(id));

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error.message} />;
  if (!adr) return <ErrorState message="ADR not found" />;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/" className="text-sm text-blue-600 hover:underline">&larr; Back to list</Link>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-start justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{adr.title}</h1>
          <StatusBadge status={adr.status} />
        </div>

        <div className="mb-6 flex flex-wrap gap-4 text-sm text-gray-500">
          {adr.date && <span>Date: {adr.date}</span>}
          {adr.authors.length > 0 && <span>Authors: {adr.authors.join(", ")}</span>}
          <span>File: {adr.filePath}</span>
        </div>

        {adr.tags.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-1.5">
            {adr.tags.map((t) => <TagChip key={t} label={t} />)}
          </div>
        )}

        <RelationshipPanel relationships={adr.relationships} />

        <div className="mt-6 space-y-6">
          {adr.context && (
            <Section title="Context">
              <Markdown remarkPlugins={[remarkGfm]}>{adr.context}</Markdown>
            </Section>
          )}
          {adr.decision && (
            <Section title="Decision">
              <Markdown remarkPlugins={[remarkGfm]}>{adr.decision}</Markdown>
            </Section>
          )}
          {adr.consequences && (
            <Section title="Consequences">
              <Markdown remarkPlugins={[remarkGfm]}>{adr.consequences}</Markdown>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-2 text-lg font-semibold text-gray-800">{title}</h2>
      <div className="prose prose-sm max-w-none text-gray-700">{children}</div>
    </div>
  );
}

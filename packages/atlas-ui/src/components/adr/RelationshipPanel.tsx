import { Link } from "react-router-dom";
import type { AdrRelationship } from "../../api/types";

const typeLabels: Record<string, string> = {
  supersedes: "Supersedes",
  superseded_by: "Superseded by",
  depends_on: "Depends on",
  depended_on_by: "Depended on by",
  relates_to: "Relates to",
  conflicts_with: "Conflicts with",
};

const typeColors: Record<string, string> = {
  supersedes: "border-red-300 bg-red-50",
  superseded_by: "border-purple-300 bg-purple-50",
  depends_on: "border-blue-300 bg-blue-50",
  depended_on_by: "border-blue-200 bg-blue-50",
  relates_to: "border-gray-300 bg-gray-50",
  conflicts_with: "border-orange-300 bg-orange-50",
};

export function RelationshipPanel({ relationships }: { relationships: AdrRelationship[] }) {
  if (relationships.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-700">Relationships</h3>
      <div className="space-y-1.5">
        {relationships.map((rel, i) => (
          <div key={i} className={`rounded-md border px-3 py-2 text-sm ${typeColors[rel.type] ?? "border-gray-200 bg-gray-50"}`}>
            <span className="font-medium text-gray-600">{typeLabels[rel.type] ?? rel.type}:</span>{" "}
            <Link to={`/adrs/${rel.adrId}`} className="text-blue-600 hover:underline">
              {rel.adrTitle}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import type { AdrListItem } from "../../api/types";
import { StatusBadge } from "../ui/StatusBadge";
import { TagChip } from "../ui/TagChip";

export function AdrTable({ adrs }: { adrs: AdrListItem[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Title</th>
            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Date</th>
            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Tags</th>
            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Components</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {adrs.map((adr) => (
            <tr key={adr.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <Link to={`/adrs/${adr.id}`} className="font-medium text-blue-600 hover:text-blue-800">
                  {adr.title}
                </Link>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={adr.status} />
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">{adr.date ?? "—"}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {adr.tags.map((t) => <TagChip key={t} label={t} />)}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">{adr.components.join(", ") || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

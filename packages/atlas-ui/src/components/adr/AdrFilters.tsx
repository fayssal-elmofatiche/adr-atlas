import type { AdrFilter } from "../../api/types";

interface Props {
  filters: AdrFilter;
  onChange: (filters: AdrFilter) => void;
  statuses: string[];
  tags: string[];
  components: string[];
}

export function AdrFilters({ filters, onChange, statuses, tags, components }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={filters.status ?? ""}
        onChange={(e) => onChange({ ...filters, status: e.target.value || undefined })}
        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-sm"
      >
        <option value="">All statuses</option>
        {statuses.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <select
        value={filters.tag ?? ""}
        onChange={(e) => onChange({ ...filters, tag: e.target.value || undefined })}
        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-sm"
      >
        <option value="">All tags</option>
        {tags.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      <select
        value={filters.component ?? ""}
        onChange={(e) => onChange({ ...filters, component: e.target.value || undefined })}
        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-sm"
      >
        <option value="">All components</option>
        {components.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  );
}

import { STATUSES, PRIORITIES } from "../constants";

export default function FilterBar({ filters, onChange }) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-slate-500">Status</label>
        <select
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value })}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-brand-500"
        >
          <option value="">All</option>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-slate-500">Priority</label>
        <select
          value={filters.priority}
          onChange={(e) => onChange({ ...filters, priority: e.target.value })}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-brand-500"
        >
          <option value="">All</option>
          {PRIORITIES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {(filters.status || filters.priority) && (
        <button
          onClick={() => onChange({ status: "", priority: "" })}
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

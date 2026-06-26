'use client';

import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search, Filter, MoreHorizontal, ArrowUpDown } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: DataRow) => React.ReactNode;
  width?: string;
}

interface DataTableProps {
  columns: Column[];
  data: DataRow[];
  keyExtractor: (row: DataRow) => string | number;
  searchable?: boolean;
  searchKeys?: string[];
  pageSize?: number;
  emptyMessage?: string;
  onRowClick?: (row: DataRow) => void;
  className?: string;
}

interface DataRow {
  [key: string]: unknown;
}

export function DataTable({
  columns,
  data,
  keyExtractor,
  searchable = true,
  searchKeys = [],
  pageSize = 10,
  emptyMessage = 'No data found',
  onRowClick,
  className = '',
}: DataTableProps) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = data;
    if (search && searchKeys.length > 0) {
      const q = search.toLowerCase();
      result = result.filter(row =>
        searchKeys.some(key => {
          const val = row[key];
          return val != null && String(val).toLowerCase().includes(q);
        })
      );
    }
    if (sortKey) {
      result = [...result].sort((a, b) => {
        const aVal = a[sortKey] ?? '';
        const bVal = b[sortKey] ?? '';
        const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return result;
  }, [data, search, searchKeys, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  return (
    <div className={`bg-surface-elevated rounded-2xl border border-border-primary overflow-hidden ${className}`}>
      
      <div className="flex items-center justify-between p-4 border-b border-border-primary gap-4 flex-wrap">
        {searchable && (
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-secondary text-ink-primary text-sm placeholder-ink-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 border border-transparent focus:border-accent-primary/50"
            />
          </div>
        )}
        <div className="flex items-center gap-2 text-xs font-bold text-ink-tertiary">
          <Filter size={14} />
          <span>{filtered.length} results</span>
        </div>
      </div>

      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-primary">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`text-left text-[10px] font-black uppercase tracking-widest text-ink-tertiary px-4 py-3 ${col.sortable ? 'cursor-pointer hover:text-ink-primary transition-colors select-none' : ''}`}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && (
                      <span className="inline-flex flex-col">
                        <ChevronUp size={10} className={sortKey === col.key && sortDir === 'asc' ? 'text-accent-primary' : 'text-ink-tertiary/40'} />
                        <ChevronDown size={10} className={sortKey === col.key && sortDir === 'desc' ? 'text-accent-primary' : 'text-ink-tertiary/40'} style={{ marginTop: -2 }} />
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-primary">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-ink-tertiary text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginated.map(row => (
                <tr
                  key={keyExtractor(row)}
                  className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-surface-secondary' : 'hover:bg-surface-secondary/50'}`}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3 text-sm text-ink-primary">
                      {col.render ? col.render(row) : String(row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-border-primary">
          <p className="text-xs text-ink-tertiary">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-ink-secondary hover:bg-surface-secondary disabled:opacity-30 transition-colors"
            >← Prev</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = page <= 3 ? i + 1 : page + i - 2;
              if (p < 1 || p > totalPages) return null;
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${page === p ? 'bg-accent-primary text-white' : 'text-ink-secondary hover:bg-surface-secondary'}`}
                >{p}</button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-ink-secondary hover:bg-surface-secondary disabled:opacity-30 transition-colors"
            >Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}

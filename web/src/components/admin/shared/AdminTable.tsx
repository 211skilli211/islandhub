import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    horizontalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { usePaginatedFetch } from '@/hooks/usePaginatedFetch';
import PaginationControls from './PaginationControls';
import SortControls from './SortControls';
import FilterControls from './FilterControls';
import ConfirmationModal from './ConfirmationModal';
import InlineEdit from './InlineEdit';
import toast from 'react-hot-toast';

export interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    sortKey?: string;
    className?: string; // Optional custom class for cell
    editable?: boolean;
    onEdit?: (item: T, newValue: string) => Promise<void>;
    renderView?: (item: T) => React.ReactNode;
}

interface AdminTableProps<T> {
    endpoint: string;
    keyName: string;
    columns: Column<T>[];
    filtersConfig?: Record<string, { label: string; options: { label: string; value: string }[] }>;
    bulkActions?: Record<string, (ids: any[]) => Promise<void>>;
    onRowAction?: (action: string, item: T) => void | Promise<void>;
    rowActions?: { label: string; action: string; className?: string; condition?: (item: T) => boolean; icon?: React.ReactNode }[];
    defaultSort?: { sortBy: string; sortOrder: 'asc' | 'desc' };
    initialFilters?: Record<string, any>;
    getRowLink?: (item: T) => string;
    idKey?: keyof T;
    searchable?: boolean;
    searchPlaceholder?: string;
}

export function AdminTable<T extends Record<string, any>>({
    endpoint,
    keyName,
    columns,
    filtersConfig,
    bulkActions,
    onRowAction,
    rowActions,
    defaultSort,
    initialFilters,
    getRowLink,
    idKey = 'id' as keyof T,
    searchable = false,
    searchPlaceholder = 'Search records...'
}: AdminTableProps<T>) {
    const router = useRouter();
    const {
        items,
        meta,
        setFilters,
        filters,
        sort,
        setSort,
        loading,
        selectedRows,
        setSelectedRows,
        handlePageChange,
        refresh,
        search,
        setSearch
    } = usePaginatedFetch<T>(endpoint, keyName, initialFilters);

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [pendingBulkAction, setPendingBulkAction] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Layout State
    const [isCompact, setIsCompact] = useState(false);
    const [viewType, setViewType] = useState<'table' | 'card'>('table');

    // Row Loading State
    const [loadingRows, setLoadingRows] = useState<any[]>([]);

    // Dropdown State
    const [openMenuId, setOpenMenuId] = useState<any>(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
    const [isMounted, setIsMounted] = useState(false);

    // Resizable Columns State
    const [columnWidths, setColumnWidths] = useState<Record<number, number>>({});
    const [columnOrder, setColumnOrder] = useState<number[]>([]);
    const [hiddenColumns, setHiddenColumns] = useState<number[]>([]);
    const [showColumnSettings, setShowColumnSettings] = useState(false);
    const resizingCol = useRef<number | null>(null);
    const startX = useRef<number>(0);
    const startWidth = useRef<number>(0);

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Initialize column order
    useEffect(() => {
        setColumnOrder(columns.map((_, idx) => idx));
    }, [columns]);

    const startResize = (index: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        resizingCol.current = index;
        startX.current = e.pageX;
        startWidth.current = columnWidths[index] || 150;

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'col-resize';
    };

    // DnD Handlers
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setColumnOrder((items) => {
                const oldIndex = items.indexOf(active.id as number);
                const newIndex = items.indexOf(over.id as number);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (resizingCol.current === null) return;
        const diff = e.pageX - startX.current;
        const newWidth = Math.max(50, startWidth.current + diff);
        setColumnWidths(prev => ({ ...prev, [resizingCol.current!]: newWidth }));
    };

    const handleMouseUp = () => {
        resizingCol.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
    };

    useEffect(() => {
        setIsMounted(true);
        // Initialize widths
        const initialWidths: Record<number, number> = {};
        columns.forEach((_, idx) => {
            initialWidths[idx] = 150; // Default start width
        });
        setColumnWidths(initialWidths);
    }, []);

    // Selection Handlers
    const toggleRow = (id: any) => {
        setSelectedRows(prev =>
            prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (selectedRows.length === items.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(items.map(item => item[idKey] as any));
        }
    };

    // Bulk Action Handlers
    const handleBulkClick = (action: string) => {
        setPendingBulkAction(action);
        setModalOpen(true);
    };

    const confirmBulkAction = async () => {
        if (!pendingBulkAction || !bulkActions) return;

        setActionLoading(true);
        // Optimistically show loading on rows
        setLoadingRows(selectedRows);

        try {
            await bulkActions[pendingBulkAction](selectedRows);
            toast.success(`${selectedRows.length} items processed successfully`);
            setSelectedRows([]);
            refresh(); // Refresh table data
        } catch (error) {
            console.error(error);
            toast.error('Failed to process items');
        } finally {
            setActionLoading(false);
            setLoadingRows([]);
            setModalOpen(false);
            setPendingBulkAction(null);
        }
    };

    // Row Action Handler
    const handleRowClick = async (action: string, item: T) => {
        if (!onRowAction) return;

        const itemId = item[idKey] as any;
        setLoadingRows(prev => [...prev, itemId]);
        try {
            await onRowAction(action, item);
            // We assume onRowAction might trigger a refresh if needed outside, 
            // or we can call refresh() here if passed down. 
            // For now, let's auto-refresh if it's a promise
            refresh();
        } catch (error) {
            console.error(error);
            toast.error('Action failed');
        } finally {
            setLoadingRows(prev => prev.filter(id => id !== itemId));
        }
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
                    {/* Search */}
                    {searchable && (
                        <div className="relative flex-1 md:flex-none md:w-64">
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    )}

                    {/* Sort */}
                    <SortControls
                        sort={sort}
                        onSortChange={setSort}
                        options={columns
                            .filter(c => c.sortKey || typeof c.accessor === 'string')
                            .map(c => ({ label: c.header, value: (c.sortKey || c.accessor) as string }))
                        }
                    />

                    {/* Filters */}
                    {filtersConfig && (
                        <FilterControls
                            filters={filters}
                            onFilterChange={setFilters}
                            config={filtersConfig}
                        />
                    )}

                    {/* Export */}
                    <button
                        onClick={() => {
                            const params = new URLSearchParams();
                            params.append('export', 'csv');

                            // If rows selected, export only those
                            if (selectedRows.length > 0) {
                                params.append('ids', selectedRows.join(','));
                            } else {
                                // Otherwise export based on current filters
                                params.append('sortBy', sort.sortBy);
                                params.append('sortOrder', sort.sortOrder);
                                if (search) params.append('search', search);
                                Object.entries(filters).forEach(([k, v]) => {
                                    if (v) params.append(k, v);
                                });
                                if (endpoint.includes('campaigns')) params.append('admin', 'true');
                            }

                            const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}${endpoint}?${params.toString()}`;
                            window.open(url, '_blank');
                        }}
                        className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-bold transition-all shadow-sm ${selectedRows.length > 0
                            ? 'bg-teal-600 text-white border-teal-600 hover:bg-teal-700'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-teal-500 hover:text-teal-600'
                            }`}
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        {selectedRows.length > 0 ? `Export (${selectedRows.length})` : 'Export CSV'}
                    </button>
                </div>

                <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
                    {/* View Toggles */}
                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                    <button
                        onClick={() => setIsCompact(!isCompact)}
                        className={`p-2 rounded-lg border transition-all ${isCompact ? 'bg-teal-50 border-teal-300 text-teal-600' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                        title={isCompact ? 'Expanded View' : 'Compact View'}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    {/* Column Settings */}
                    <div className="relative">
                        <button
                            onClick={() => setShowColumnSettings(!showColumnSettings)}
                            className={`p-2 rounded-lg border transition-all ${showColumnSettings ? 'bg-teal-50 border-teal-300 text-teal-600' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                            title="Column Settings"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                            </svg>
                        </button>
                        
                        {showColumnSettings && isMounted && createPortal(
                            <div className="fixed inset-0 z-9999" onClick={() => setShowColumnSettings(false)}>
                                <div 
                                    className="absolute bg-white rounded-xl shadow-2xl border border-slate-100 py-3 animate-in fade-in slide-in-from-top-2 duration-200 w-64"
                                    style={{ top: '180px', right: '20px' }}
                                    onClick={e => e.stopPropagation()}
                                >
                                    <div className="px-3 py-2 border-b border-slate-100 mb-2">
                                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Columns</p>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {columns.map((col, idx) => (
                                            <label
                                                key={idx}
                                                className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={!hiddenColumns.includes(idx)}
                                                    onChange={() => {
                                                        if (hiddenColumns.includes(idx)) {
                                                            setHiddenColumns(prev => prev.filter(i => i !== idx));
                                                        } else {
                                                            setHiddenColumns(prev => [...prev, idx]);
                                                        }
                                                    }}
                                                    className="w-4 h-4 rounded border-slate-300 text-teal-600"
                                                />
                                                <span className="text-sm font-medium text-slate-700">{col.header}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <div className="px-3 py-2 border-t border-slate-100 mt-2 flex gap-2">
                                        <button 
                                            onClick={() => {
                                                setHiddenColumns([]);
                                                setColumnOrder(columns.map((_, idx) => idx));
                                            }}
                                            className="text-xs text-slate-500 hover:text-teal-600"
                                        >
                                            Reset All
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                    <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

                    <button
                        onClick={() => setIsCompact(!isCompact)}
                        className={`px-3 py-2 border rounded-lg text-xs font-bold transition-all ${isCompact ? 'bg-teal-50 border-teal-200 text-teal-600' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                    >
                        {isCompact ? 'Expanded Mode' : 'Compact Mode'}
                    </button>

                    {/* Bulk Actions Toolbar */}
                    {bulkActions && selectedRows.length > 0 && (
                        <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
                            {Object.keys(bulkActions).map(action => (
                                <button
                                    key={action}
                                    onClick={() => handleBulkClick(action)}
                                    className="px-3 py-1.5 bg-slate-800 text-white text-sm font-bold rounded-lg hover:bg-slate-700 shadow-lg shadow-slate-200 transition-all capitalize"
                                >
                                    {action} ({selectedRows.length})
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Table */}
            {/* Table / Card View Toggle or Responsive Logic */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                {/* Desktop Table View */}
                {viewType === 'table' && (
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    {bulkActions && (
                                        <th className="px-6 py-4 w-12 text-center">
                                            <input
                                                type="checkbox"
                                                checked={items.length > 0 && selectedRows.length === items.length}
                                                onChange={toggleAll}
                                                className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                            />
                                        </th>
                                    )}
                                    {columns.map((col, idx) => {
                                        if (hiddenColumns.includes(idx)) return null;
                                        // Use columnOrder for display order
                                        return (
                                            className={`${isCompact ? 'px-4 py-2' : 'px-6 py-4'} text-xs font-black text-slate-400 uppercase tracking-widest leading-none relative group select-none`}
                                            style={{ width: columnWidths[idx], minWidth: columnWidths[idx], maxWidth: columnWidths[idx] }}
                                        >
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <span className="truncate">{col.header}</span>
                                            </div>
                                            {/* Resizer Handle */}
                                            <div
                                                className="absolute right-0 top-0 bottom-0 w-4 cursor-col-resize hover:bg-teal-500/10 group-hover:bg-slate-300/20 transition-colors z-10 flex flex-col justify-center items-center gap-0.5"
                                                onMouseDown={(e) => startResize(idx, e)}
                                                onClick={e => e.stopPropagation()}
                                            >
                                                <div className="w-0.5 h-3 bg-slate-300 rounded-full"></div>
                                            </div>
                                        </th>
                                    );})}
                                    {(rowActions || onRowAction) && <th className={`${isCompact ? 'px-4 py-2' : 'px-6 py-4'} text-xs font-black text-slate-400 uppercase tracking-widest leading-none text-right`}>Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            {bulkActions && <td className="px-6 py-4"><div className="w-4 h-4 bg-slate-200 rounded"></div></td>}
                                            {columns.map((_, j) => (
                                                <td key={j} className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                                            ))}
                                            {(rowActions || onRowAction) && <td className="px-6 py-4"><div className="h-8 w-16 bg-slate-200 rounded ml-auto"></div></td>}
                                        </tr>
                                    ))
                                ) : items.length === 0 ? (
                                    <tr>
                                        <td colSpan={columns.length + (bulkActions ? 1 : 0) + ((rowActions || onRowAction) ? 1 : 0)} className="px-6 py-20 text-center text-slate-400">
                                            <div className="text-4xl mb-2">🍃</div>
                                            <p className="font-medium">No results found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    items.map((item) => (
                                        <tr
                                            key={item[idKey] as any}
                                            onClick={(e) => {
                                                if (getRowLink) {
                                                    const target = e.target as HTMLElement;
                                                    if (target.closest('button') || target.closest('input') || target.closest('a')) return;
                                                    router.push(getRowLink(item));
                                                }
                                            }}
                                            className={`transition-colors group ${selectedRows.includes(item[idKey] as any) ? 'bg-teal-50/50' : 'hover:bg-slate-50'} ${getRowLink ? 'cursor-pointer' : ''}`}
                                        >
                                            {bulkActions && (
                                                <td className="px-6 py-4 w-12 text-center" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRows.includes(item[idKey] as any)}
                                                        onChange={() => toggleRow(item[idKey] as any)}
                                                        className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-50"
                                                    />
                                                </td>
                                            )}
                                            {columns.map((col, idx) => {
                                                if (hiddenColumns.includes(idx)) return null;
                                                return (
                                                <td key={`cell-${item[idKey] as any}-${idx}`} className={`${isCompact ? 'px-4 py-2 text-xs' : 'px-6 py-4 text-sm'} text-slate-600 font-medium ${col.className || ''}`}>
                                                    {col.editable && col.onEdit && typeof col.accessor !== 'function' ? (
                                                        <InlineEdit
                                                            value={String(item[col.accessor] ?? '')}
                                                            onSave={async (val) => col.onEdit!(item, val)}
                                                            renderView={col.renderView ? () => col.renderView!(item) : undefined}
                                                        />
                                                    ) : (
                                                        typeof col.accessor === 'function' ? col.accessor(item) : (item[col.accessor] as React.ReactNode)
                                                    )}
                                                    {loadingRows.includes(item[idKey] as any) && idx === 0 && (
                                                        <span className="inline-flex items-center ml-2 px-2 py-0.5 rounded text-[10px] bg-indigo-50 text-indigo-600 animate-pulse">
                                                            Wait...
                                                        </span>
                                                    )}
                                                </td>
                                            );})}
                                            {(rowActions || onRowAction) && (
                                                <td className={`${isCompact ? 'px-4 py-2' : 'px-6 py-4'} text-right relative`} onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex justify-end">
                                                        <button
                                                            onClick={(e) => {
                                                                const rect = e.currentTarget.getBoundingClientRect();
                                                                setMenuPosition({
                                                                    top: rect.bottom + window.scrollY,
                                                                    right: window.innerWidth - rect.right
                                                                });
                                                                setOpenMenuId(openMenuId === item[idKey] ? null : item[idKey]);
                                                            }}
                                                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-200"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                                            </svg>
                                                        </button>
                                                    </div>

                                                    {openMenuId === item[idKey] && isMounted && createPortal(
                                                        <div className="fixed inset-0 z-9999" onClick={() => setOpenMenuId(null)}>
                                                            <div
                                                                style={{
                                                                    position: 'absolute',
                                                                    top: menuPosition.top - window.scrollY,
                                                                    right: menuPosition.right,
                                                                }}
                                                                className="w-48 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <div className="px-3 py-1 mb-1 border-b border-slate-50">
                                                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Options</p>
                                                                </div>
                                                                {rowActions?.map((action, aIdx) => {
                                                                    if (action.condition && !action.condition(item)) return null;
                                                                    return (
                                                                        <button
                                                                            key={`act-${item[idKey] as any}-${action.action}-${aIdx}`}
                                                                            onClick={() => {
                                                                                handleRowClick(action.action, item);
                                                                                setOpenMenuId(null);
                                                                            }}
                                                                            disabled={loadingRows.includes(item[idKey] as any)}
                                                                            className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors flex items-center gap-2 hover:bg-slate-50 ${action.className || 'text-slate-600 hover:text-teal-600'}`}
                                                                        >
                                                                            {action.icon && <span>{action.icon}</span>}
                                                                            <span>{action.label}</span>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>,
                                                        document.body
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Grid View (Desktop & Tablet) */}
                {viewType === 'card' && !loading && items.length > 0 && (
                    <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                        {items.map((item) => {
                            // Smart Column Detection
                            const imageCol = columns.find(c => ['Avatar', 'Logo', 'Preview'].includes(c.header));
                            const titleCol = columns.find(c => ['Name', 'Title'].includes(c.header)) || columns[1]; // Fallback to 2nd column (usually name/title after ID)
                            const statusCol = columns.find(c => ['Status', 'Verified'].includes(c.header));

                            // Filter out semantic columns to avoid duplication
                            const detailColumns = columns.filter(c => c !== imageCol && c !== titleCol);

                            return (
                                <div
                                    key={item[idKey] as any}
                                    onClick={() => getRowLink && router.push(getRowLink(item))}
                                    className={`group relative rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col ${selectedRows.includes(item[idKey] as any) ? 'border-teal-500 bg-teal-50/10' : 'border-slate-100 bg-white hover:border-teal-200 hover:shadow-xl hover:-translate-y-1'} ${getRowLink ? 'cursor-pointer' : ''}`}
                                >
                                    {/* Action Header */}
                                    <div className="absolute top-3 right-3 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {rowActions?.map(action => (
                                            (!action.condition || action.condition(item)) && (
                                                <button
                                                    key={action.action}
                                                    onClick={(e) => { e.stopPropagation(); handleRowClick(action.action, item); }}
                                                    className="p-1.5 rounded-full bg-white/90 backdrop-blur text-slate-500 hover:text-teal-600 shadow-sm border border-slate-100"
                                                    title={action.label}
                                                >
                                                    {/* Use icon if available, else simple fallback */}
                                                    {action.icon ? action.icon : (action.action.includes('delete') ? '🗑️' : action.action.includes('edit') ? '✏️' : '⚡')}
                                                </button>
                                            )
                                        ))}
                                    </div>

                                    {/* Card Header (Image + Title) */}
                                    <div className="p-5 flex flex-col items-center text-center border-b border-slate-50 relative overflow-hidden bg-slate-50/30">
                                        {bulkActions && (
                                            <div className="absolute top-3 left-3 z-10" onClick={e => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.includes(item[idKey] as any)}
                                                    onChange={() => toggleRow(item[idKey] as any)}
                                                    className="w-5 h-5 rounded-md border-slate-300 text-teal-600 focus:ring-offset-0"
                                                />
                                            </div>
                                        )}

                                        <div className="mb-3 transform group-hover:scale-105 transition-transform duration-300">
                                            {imageCol ? (
                                                <div className="[&>div]:w-20 [&>div]:h-20 [&>div]:rounded-2xl [&>div]:shadow-md">
                                                    {typeof imageCol.accessor === 'function' ? imageCol.accessor(item) : (item[imageCol.accessor] as React.ReactNode)}
                                                </div>
                                            ) : (
                                                <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center text-2xl font-black text-slate-300 shadow-inner">
                                                    {(item as any).name?.charAt(0) || '#'}
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="font-black text-slate-800 line-clamp-1 text-lg leading-tight mb-1">
                                            {titleCol ? (typeof titleCol.accessor === 'function' ? titleCol.accessor(item) : item[titleCol.accessor] as React.ReactNode) : `Item #${item.id}`}
                                        </h3>

                                        {statusCol && (
                                            <div className="scale-90 opacity-80">
                                                {typeof statusCol.accessor === 'function' ? statusCol.accessor(item) : item[statusCol.accessor] as React.ReactNode}
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Details Grid */}
                                    <div className="p-4 grid grid-cols-2 gap-y-3 gap-x-2 bg-white flex-1 content-start">
                                        {detailColumns.slice(0, 6).map((col, idx) => (
                                            <div key={`card-det-${item.id}-${idx}`} className="flex flex-col">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{col.header}</p>
                                                <div className="text-slate-600 font-bold text-xs truncate">
                                                    {typeof col.accessor === 'function' ? col.accessor(item) : (item[col.accessor] as React.ReactNode)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Footer ID */}
                                    <div className="px-4 py-2 bg-slate-50/50 text-[9px] font-mono text-slate-300 text-right uppercase tracking-widest">
                                        ID: {item[idKey] as any}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Mobile View (Card List - Only if viewType is table) */}
                {viewType === 'table' && (
                    <div className="md:hidden divide-y divide-slate-100">
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <div key={i} className="p-4 animate-pulse space-y-3">
                                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                                    <div className="h-3 bg-slate-100 rounded w-3/4"></div>
                                    <div className="h-8 bg-slate-200 rounded w-24"></div>
                                </div>
                            ))
                        ) : items.length === 0 ? (
                            <div className="px-6 py-20 text-center text-slate-400">
                                <div className="text-4xl mb-2">🍃</div>
                                <p className="font-medium">No results found</p>
                            </div>
                        ) : (
                            items.map((item) => (
                                <div
                                    key={item[idKey] as any}
                                    className={`p-4 transition-colors ${selectedRows.includes(item[idKey] as any) ? 'bg-teal-50/50' : 'active:bg-slate-50'}`}
                                    onClick={() => getRowLink && router.push(getRowLink(item))}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            {bulkActions && (
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.includes(item[idKey] as any)}
                                                    onChange={(e) => { e.stopPropagation(); toggleRow(item[idKey] as any); }}
                                                    className="w-5 h-5 rounded border-slate-300 text-teal-600"
                                                />
                                            )}
                                            <div className="font-bold text-slate-900">
                                                {columns[1] ? (
                                                    typeof columns[1].accessor === 'function'
                                                        ? columns[1].accessor(item)
                                                        : (item[columns[1].accessor as keyof T] as React.ReactNode)
                                                ) : (
                                                    <span className="text-slate-300">Item #{item[idKey] as any}</span>
                                                )}
                                            </div>
                                        </div>
                                        {loadingRows.includes(item[idKey] as any) && (
                                            <span className="text-[10px] font-black uppercase text-indigo-500">Wait...</span>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-y-2 mb-4 pl-8">
                                        {columns.slice(2).map((col, idx) => (
                                            <div key={idx} className="text-xs">
                                                <div className="text-slate-400 font-black uppercase tracking-widest scale-75 origin-left">{col.header}</div>
                                                <div className="text-slate-600 font-medium">
                                                    {typeof col.accessor === 'function' ? col.accessor(item) : (item[col.accessor] as React.ReactNode)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {(rowActions || onRowAction) && (
                                        <div className="flex flex-wrap gap-2 mt-3 sm:mt-0 pl-0 sm:pl-8" onClick={e => e.stopPropagation()}>
                                            {rowActions?.map(action => {
                                                if (action.condition && !action.condition(item)) return null;
                                                return (
                                                    <button
                                                        key={action.action}
                                                        onClick={() => handleRowClick(action.action, item)}
                                                        disabled={loadingRows.includes(item[idKey] as any)}
                                                        className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 ${action.className || 'bg-slate-100 text-slate-600 border border-slate-200'}`}
                                                    >
                                                        {action.icon && <span>{action.icon}</span>}
                                                        {action.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            <PaginationControls
                currentPage={meta.page}
                totalPages={meta.totalPages}
                onPageChange={handlePageChange}
            />

            <ConfirmationModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={confirmBulkAction}
                title={`Confirm ${pendingBulkAction}`}
                message={`Are you sure you want to ${pendingBulkAction} ${selectedRows.length} selected items?`}
                confirmLabel={pendingBulkAction || 'Confirm'}
                isDangerous={pendingBulkAction === 'delete'}
                loading={actionLoading}
            />
        </div>
    );
}

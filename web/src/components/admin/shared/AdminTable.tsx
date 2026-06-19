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
import HoverPreview from './HoverPreview';
import toast from '@/lib/toast';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

export interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    sortKey?: string;
    className?: string; // Optional custom class for cell
    editable?: boolean;
    onEdit?: (item: T, newValue: string) => Promise<void>;
    renderView?: (item: T) => React.ReactNode;
    previewField?: keyof T; // Field to show in hover preview
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
    hoverType?: 'user' | 'listing' | 'store' | 'order' | 'media';
}

function SortableColumnHeader<T>({ 
    id, col, idx, isCompact, columnWidths, startResize 
}: { 
    id: number; 
    col: Column<T>; 
    idx: number; 
    isCompact: boolean; 
    columnWidths: Record<number, number>;
    startResize: (index: number, e: React.MouseEvent) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <th
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className={`${isCompact ? 'px-4 py-2' : 'px-6 py-4'} text-xs font-black text-ink-tertiary uppercase tracking-widest leading-none relative group select-none cursor-grab active:cursor-grabbing`}
            style={{ 
                ...style,
                width: columnWidths[idx], 
                minWidth: columnWidths[idx], 
                maxWidth: columnWidths[idx] 
            }}
        >
            <div className="flex items-center gap-2 overflow-hidden">
                <span className="truncate">{col.header}</span>
                {isDragging && <EmojiIcon emoji="✋" size=16 className="text-[10px]" />}
            </div>
            
            <div
                className="absolute right-0 top-0 bottom-0 w-4 cursor-col-resize hover:bg-accent-500/100/10 group-hover:bg-surface-tertiary/20 transition-colors z-10 flex flex-col justify-center items-center gap-0.5"
                onMouseDown={(e) => startResize(idx, e)}
                onClick={e => e.stopPropagation()}
            >
                <div className="w-0.5 h-3 bg-surface-tertiary rounded-full"></div>
            </div>
        </th>
    );
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
    searchPlaceholder = 'Search records...',
    hoverType
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
                const oldIndex = items.indexOf(columnOrder[active.id as number]);
                const newIndex = items.indexOf(columnOrder[over.id as number]);
                const newOrder = arrayMove(items, oldIndex, newIndex);
                return newOrder;
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
        <div className="space-y-3">
            
            <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center bg-surface-elevated p-3 rounded-xl border border-border-primary">
                <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
                    
                    {searchable && (
                        <div className="relative flex-1 md:flex-none md:w-56">
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-1.5 bg-surface-secondary border border-border-primary rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-accent-400/20 focus:border-accent-500 transition-all"
                            />
                            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-ink-tertiary">
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    )}

                    
                    <SortControls
                        sort={sort}
                        onSortChange={setSort}
                        options={columns
                            .filter(c => c.sortKey || typeof c.accessor === 'string')
                            .map(c => ({ label: c.header, value: (c.sortKey || c.accessor) as string }))}
                    />

                    
                    {filtersConfig && (
                        <FilterControls
                            filters={filters}
                            onFilterChange={setFilters}
                            config={filtersConfig}
                        />
                    )}
                </div>

                <div className="flex flex-wrap gap-2 items-center w-full md:w-auto justify-end">
                    
                    <div className="flex bg-surface-secondary p-0.5 rounded-lg border border-border-primary">
                        <button
                            onClick={() => setViewType('table')}
                            className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${viewType === 'table' ? 'bg-accent-500 text-white shadow-sm' : 'text-ink-tertiary hover:text-ink-secondary'}`}
                            title="Table View"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        <button
                            onClick={() => setViewType('card')}
                            className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${viewType === 'card' ? 'bg-accent-500 text-white shadow-sm' : 'text-ink-tertiary hover:text-ink-secondary'}`}
                            title="Card View"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                        </button>
                    </div>

                    
                    <button
                        onClick={() => setIsCompact(!isCompact)}
                        className={`px-2 py-1 border rounded-lg text-[10px] font-bold transition-all ${isCompact ? 'bg-accent-500/10 border-accent-300 text-accent-500' : 'bg-surface-elevated border-border-primary text-ink-tertiary hover:border-border-primary'}`}
                        title={isCompact ? 'Expanded View' : 'Compact View'}
                    >
                        {isCompact ? 'Expand' : 'Compact'}
                    </button>

                    
                    <div className="relative">
                        <button
                            onClick={() => setShowColumnSettings(!showColumnSettings)}
                            className={`p-1.5 rounded-lg border transition-all ${showColumnSettings ? 'bg-accent-500/10 border-accent-300 text-accent-500' : 'bg-surface-elevated border-border-primary text-ink-tertiary hover:border-border-primary'}`}
                            title="Column Settings"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                            </svg>
                        </button>
                        {showColumnSettings && isMounted && createPortal(
                            <div className="fixed inset-0 z-9999" onClick={() => setShowColumnSettings(false)}>
                                <div
                                    className="absolute bg-surface-elevated rounded-xl shadow-2xl border border-border-primary py-2 w-56"
                                    style={{ top: '160px', right: '16px' }}
                                    onClick={e => e.stopPropagation()}
                                >
                                    <div className="px-3 py-1.5 border-b border-border-primary mb-1">
                                        <p className="text-[9px] font-black text-ink-tertiary uppercase tracking-widest">Columns</p>
                                    </div>
                                    <div className="max-h-56 overflow-y-auto">
                                        {columns.map((col, idx) => (
                                            <label key={idx} className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-surface-secondary cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={!hiddenColumns.includes(idx)}
                                                    onChange={() => {
                                                        if (hiddenColumns.includes(idx)) setHiddenColumns(prev => prev.filter(i => i !== idx));
                                                        else setHiddenColumns(prev => [...prev, idx]);
                                                    }}
                                                    className="w-3.5 h-3.5 rounded border-border-primary text-accent-500"
                                                />
                                                <span className="text-xs font-medium text-ink-secondary">{col.header}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <div className="px-3 py-1.5 border-t border-border-primary mt-1">
                                        <button onClick={() => { setHiddenColumns([]); setColumnOrder(columns.map((_, idx) => idx)); }}
                                            className="text-[10px] text-ink-tertiary hover:text-accent-500 font-medium">Reset All</button>
                                    </div>
                                </div>
                            </div>,
                            document.body
                        )}
                    </div>

                    
                    <button
                        onClick={() => {
                            const params = new URLSearchParams();
                            params.append('export', 'csv');
                            if (selectedRows.length > 0) params.append('ids', selectedRows.join(','));
                            else {
                                params.append('sortBy', sort.sortBy);
                                params.append('sortOrder', sort.sortOrder);
                                if (search) params.append('search', search);
                                Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
                            }
                            window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}${endpoint}?${params.toString()}`, '_blank');
                        }}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 border rounded-lg text-[10px] font-bold transition-all ${selectedRows.length > 0 ? 'bg-accent-500 text-white border-accent-600 hover:bg-accent-600' : 'bg-surface-elevated border-border-primary text-ink-secondary hover:border-accent-500 hover:text-accent-500'}`}
                    >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        {selectedRows.length > 0 ? `Export (${selectedRows.length})` : 'CSV'}
                    </button>

                    
                    {bulkActions && selectedRows.length > 0 && (
                        <div className="flex gap-1.5">
                            {Object.keys(bulkActions).map(action => (
                                <button key={action} onClick={() => handleBulkClick(action)}
                                    className="px-2.5 py-1.5 bg-accent-500 text-white text-[10px] font-bold rounded-lg hover:bg-accent-600 transition-all capitalize">
                                    {action} ({selectedRows.length})
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-surface-elevated rounded-xl border border-border-primary shadow-sm overflow-hidden min-h-[400px]">
                
                {viewType === 'table' && (
                    <div className="hidden md:block overflow-x-auto">
                        <DndContext 
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-secondary border-b border-border-primary">
                                    {bulkActions && (
                                        <th className="px-6 py-4 w-12 text-center">
                                            <input
                                                type="checkbox"
                                                checked={items.length > 0 && selectedRows.length === items.length}
                                                onChange={toggleAll}
                                                className="w-4 h-4 rounded border-border-primary text-accent-400 focus:ring-accent-400"
                                            />
                                        </th>
                                    )}
                                    <SortableContext 
                                        items={columnOrder} 
                                        strategy={horizontalListSortingStrategy}
                                    >
                                        {columnOrder.map((colIdx, orderIdx) => {
                                            const col = columns[colIdx];
                                            if (hiddenColumns.includes(colIdx)) return null;
                                            return (
                                                <SortableColumnHeader 
                                                    key={`head-${col.header}-${colIdx}`}
                                                    id={orderIdx}
                                                    col={col}
                                                    idx={colIdx}
                                                    isCompact={isCompact}
                                                    columnWidths={columnWidths}
                                                    startResize={startResize}
                                                />
                                            );})}
                                    </SortableContext>
                                    {(rowActions || onRowAction) && <th className={`${isCompact ? 'px-4 py-2' : 'px-6 py-4'} text-xs font-black text-ink-tertiary uppercase tracking-widest leading-none text-right`}>Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            {bulkActions && <td className="px-6 py-4"><div className="w-4 h-4 bg-surface-tertiary rounded"></div></td>}
                                            {columns.map((_, j) => (
                                                <td key={j} className="px-6 py-4"><div className="h-4 bg-surface-tertiary rounded w-24"></div></td>
                                            ))}
                                            {(rowActions || onRowAction) && <td className="px-6 py-4"><div className="h-8 w-16 bg-surface-tertiary rounded ml-auto"></div></td>}
                                        </tr>
                                    ))
                                ) : items.length === 0 ? (
                                    <tr>
                                        <td colSpan={columns.length + (bulkActions ? 1 : 0) + ((rowActions || onRowAction) ? 1 : 0)} className="px-6 py-20 text-center text-ink-tertiary">
                                            <EmojiIcon emoji="🍃" size=40 className="text-4xl mb-2" />
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
                                            className={`transition-colors group ${selectedRows.includes(item[idKey] as any) ? 'bg-accent-500/10/50' : 'hover:bg-surface-secondary'} ${getRowLink ? 'cursor-pointer' : ''}`}
                                        >
                                            {bulkActions && (
                                                <td className="px-6 py-4 w-12 text-center" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRows.includes(item[idKey] as any)}
                                                        onChange={() => toggleRow(item[idKey] as any)}
                                                        className="w-4 h-4 rounded border-border-primary text-accent-400 focus:ring-teal-50"
                                                    />
                                                </td>
                                            )}
                                            {columns.map((col, idx) => {
                                                if (hiddenColumns.includes(idx)) return null;
                                                const cellContent = (
                                                    <>
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
                                                            <span className="inline-flex items-center ml-2 px-2 py-0.5 rounded text-[10px] bg-[#14b8a6]/10 text-[#14b8a6] animate-pulse">
                                                                Wait...
                                                            </span>
                                                        )}
                                                    </>
                                                );
                                                return (
                                                <td key={`cell-${item[idKey] as any}-${idx}`} className={`${isCompact ? 'px-4 py-2 text-xs' : 'px-6 py-4 text-sm'} text-ink-secondary font-medium ${col.className || ''}`}>
                                                    {hoverType && idx === 0 ? (
                                                        <HoverPreview data={item} type={hoverType}>
                                                            {cellContent}
                                                        </HoverPreview>
                                                    ) : cellContent}
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
                                                            className="p-2 hover:bg-surface-secondary rounded-lg text-ink-tertiary hover:text-ink-secondary transition-all border border-transparent hover:border-border-primary"
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
                                                                className="w-48 bg-surface-elevated rounded-xl shadow-2xl border border-border-primary py-2 animate-in fade-in slide-in-from-top-2 duration-200"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <div className="px-3 py-1 mb-1 border-b border-border-primary">
                                                                    <p className="text-[10px] font-black text-ink-tertiary uppercase tracking-widest">Options</p>
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
                                                                            className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors flex items-center gap-2 hover:bg-surface-secondary ${action.className || 'text-ink-secondary hover:text-accent-400'}`}
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
                    </DndContext>
                    </div>
                )}

                
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
                                    className={`group relative rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col ${selectedRows.includes(item[idKey] as any) ? 'border-teal-500 bg-accent-500/10/10' : 'border-border-primary bg-surface-elevated hover:border-teal-200 hover:shadow-xl hover:-translate-y-1'} ${getRowLink ? 'cursor-pointer' : ''}`}
                                >
                                    
                                    <div className="absolute top-3 right-3 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {rowActions?.map(action => (
                                            (!action.condition || action.condition(item)) && (
                                                <button
                                                    key={action.action}
                                                    onClick={(e) => { e.stopPropagation(); handleRowClick(action.action, item); }}
                                                    className="p-1.5 rounded-full bg-surface-elevated/90 backdrop-blur text-ink-tertiary hover:text-accent-400 shadow-sm border border-border-primary"
                                                    title={action.label}
                                                >
                                                    
                                                    {action.icon ? action.icon : (action.action.includes('delete') ? '🗑️' : action.action.includes('edit') ? '✏️' : '<EmojiIcon emoji="⚡" size=16 />')}
                                                </button>
                                            )
                                        ))}
                                    </div>

                                    
                                    <div className="p-5 flex flex-col items-center text-center border-b border-border-primary relative overflow-hidden bg-surface-secondary/30">
                                        {bulkActions && (
                                            <div className="absolute top-3 left-3 z-10" onClick={e => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.includes(item[idKey] as any)}
                                                    onChange={() => toggleRow(item[idKey] as any)}
                                                    className="w-5 h-5 rounded-md border-border-primary text-accent-400 focus:ring-offset-0"
                                                />
                                            </div>
                                        )}

                                        <div className="mb-3 transform group-hover:scale-105 transition-transform duration-300">
                                            {imageCol ? (
                                                <div className="[&>div]:w-20 [&>div]:h-20 [&>div]:rounded-2xl [&>div]:shadow-md">
                                                    {typeof imageCol.accessor === 'function' ? imageCol.accessor(item) : (item[imageCol.accessor] as React.ReactNode)}
                                                </div>
                                            ) : (
                                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sand-100 to-sand-200 flex items-center justify-center text-2xl font-black text-ink-tertiary shadow-inner">
                                                    {(item as any).name?.charAt(0) || '#'}
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="font-black text-ink-primary line-clamp-1 text-lg leading-tight mb-1">
                                            {titleCol ? (typeof titleCol.accessor === 'function' ? titleCol.accessor(item) : item[titleCol.accessor] as React.ReactNode) : `Item #${item.id}`}
                                        </h3>

                                        {statusCol && (
                                            <div className="scale-90 opacity-80">
                                                {typeof statusCol.accessor === 'function' ? statusCol.accessor(item) : item[statusCol.accessor] as React.ReactNode}
                                            </div>
                                        )}
                                    </div>

                                    
                                    <div className="p-4 grid grid-cols-2 gap-y-3 gap-x-2 bg-surface-elevated flex-1 content-start">
                                        {detailColumns.slice(0, 6).map((col, idx) => (
                                            <div key={`card-det-${item.id}-${idx}`} className="flex flex-col">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-ink-tertiary mb-0.5">{col.header}</p>
                                                <div className="text-ink-secondary font-bold text-xs truncate">
                                                    {typeof col.accessor === 'function' ? col.accessor(item) : (item[col.accessor] as React.ReactNode)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    
                                    <div className="px-4 py-2 bg-surface-secondary/50 text-[9px] font-mono text-ink-tertiary text-right uppercase tracking-widest">
                                        ID: {item[idKey] as any}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                
                {viewType === 'table' && (
                    <div className="md:hidden divide-y divide-slate-100">
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <div key={i} className="p-4 animate-pulse space-y-3">
                                    <div className="h-4 bg-surface-tertiary rounded w-1/2"></div>
                                    <div className="h-3 bg-surface-secondary rounded w-3/4"></div>
                                    <div className="h-8 bg-surface-tertiary rounded w-24"></div>
                                </div>
                            ))
                        ) : items.length === 0 ? (
                            <div className="px-6 py-20 text-center text-ink-tertiary">
                                <EmojiIcon emoji="🍃" size=40 className="text-4xl mb-2" />
                                <p className="font-medium">No results found</p>
                            </div>
                        ) : (
                            items.map((item) => (
                                <div
                                    key={item[idKey] as any}
                                    className={`p-4 transition-colors ${selectedRows.includes(item[idKey] as any) ? 'bg-accent-500/10/50' : 'active:bg-surface-secondary'}`}
                                    onClick={() => getRowLink && router.push(getRowLink(item))}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            {bulkActions && (
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.includes(item[idKey] as any)}
                                                    onChange={(e) => { e.stopPropagation(); toggleRow(item[idKey] as any); }}
                                                    className="w-5 h-5 rounded border-border-primary text-accent-400"
                                                />
                                            )}
                                            <div className="font-bold text-ink-primary">
                                                {columns[1] ? (
                                                    typeof columns[1].accessor === 'function'
                                                        ? columns[1].accessor(item)
                                                        : (item[columns[1].accessor as keyof T] as React.ReactNode)
                                                ) : (
                                                    <span className="text-ink-tertiary">Item #{item[idKey] as any}</span>
                                                )}
                                            </div>
                                        </div>
                                        {loadingRows.includes(item[idKey] as any) && (
                                            <span className="text-[10px] font-black uppercase text-[#a5b4fc]0">Wait...</span>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-y-2 mb-4 pl-8">
                                        {columns.slice(2).map((col, idx) => (
                                            <div key={idx} className="text-xs">
                                                <div className="text-ink-tertiary font-black uppercase tracking-widest scale-75 origin-left">{col.header}</div>
                                                <div className="text-ink-secondary font-medium">
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
                                                        className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 ${action.className || 'bg-surface-secondary text-ink-secondary border border-border-primary'}`}
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

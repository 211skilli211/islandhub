'use client';

import { useState, useEffect } from 'react';
import { X, Search, Image, Film, Check, Loader2, Upload, Trash2 } from 'lucide-react';
import api from '@/lib/api';

type MediaItem = {
  id?: number;
  filename: string;
  url: string;
  file_type: string;
  file_size?: number;
  created_at?: string;
  user_name?: string;
};

type MediaLibraryProps = {
  onSelect: (url: string) => void;
  onClose: () => void;
  accept?: 'image' | 'video' | 'all';
};

export default function MediaLibrary({ onSelect, onClose, accept = 'all' }: MediaLibraryProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/media', {
        params: { page, limit: 20, search: search || undefined },
      });
      const data = res.data?.assets || res.data?.media || res.data || [];
      const total = res.data?.total || data.length;
      const pages = res.data?.totalPages || 1;
      setItems(Array.isArray(data) ? data : []);
      setTotalPages(pages);
    } catch {
      setItems([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMedia();
  }, [page, search]);

  const handleSelect = () => {
    if (selected) onSelect(selected);
  };

  const handleDelete = async (filename: string) => {
    try {
      await api.delete(`/uploads/${filename}`);
      setItems(items.filter(i => i.filename !== filename));
      if (selected === `/api/media/file/${filename}`) setSelected(null);
    } catch {
      // silent
    }
    setConfirmDelete(null);
  };

  const isImage = (item: MediaItem) =>
    item.file_type?.startsWith('image/') || item.url?.match(/\.(jpg|jpeg|png|gif|webp|avif|heic)$/i);

  const isVideo = (item: MediaItem) =>
    item.file_type?.startsWith('video/') || item.url?.match(/\.(mp4|webm|mov|avi|mkv)$/i);

  const filtered = items.filter((item) => {
    if (accept === 'image') return isImage(item);
    if (accept === 'video') return isVideo(item);
    return true;
  });

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-surface-elevated rounded-2xl border border-border-primary overflow-hidden max-w-3xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-primary shrink-0">
          <h3 className="text-sm font-bold text-ink-primary">Media Library</h3>
          <button onClick={onClose} className="p-1 text-ink-tertiary hover:text-ink-primary">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="px-4 py-3 border-b border-border-primary shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-tertiary" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search files..."
              className="w-full pl-9 pr-4 py-2 bg-surface-secondary rounded-lg text-sm text-ink-primary border border-border-primary focus:border-accent-500/50 focus:outline-none"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 text-accent-500 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Image className="h-12 w-12 text-ink-tertiary/30 mx-auto mb-3" />
              <p className="text-sm text-ink-secondary">No media found</p>
              <p className="text-[10px] text-ink-tertiary mt-1">Upload files to see them here</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {filtered.map((item) => {
                const url = item.url?.startsWith('http') ? item.url : item.url;
                const isImg = isImage(item);
                const isSelected = selected === url;
                const isConfirmingDelete = confirmDelete === item.filename;

                return (
                  <div
                    key={item.filename}
                    className={`relative group rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-accent-500 ring-2 ring-accent-500/20'
                        : 'border-transparent hover:border-border-primary'
                    }`}
                    onClick={() => setSelected(isSelected ? null : url)}
                  >
                    {/* Thumbnail */}
                    <div className="aspect-square bg-surface-secondary">
                      {isImg ? (
                        <img src={url} alt={item.filename} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {isVideo(item) ? (
                            <Film className="h-8 w-8 text-ink-tertiary" />
                          ) : (
                            <div className="text-[8px] text-ink-tertiary truncate px-1">{item.filename}</div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Selected check */}
                    {isSelected && (
                      <div className="absolute top-1 right-1 p-0.5 bg-accent-500 rounded-full">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}

                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isConfirmingDelete) {
                          handleDelete(item.filename);
                        } else {
                          setConfirmDelete(item.filename);
                          setTimeout(() => setConfirmDelete(null), 3000);
                        }
                      }}
                      className={`absolute top-1 left-1 p-1 rounded-md transition-all ${
                        isConfirmingDelete
                          ? 'bg-red-500 text-white opacity-100'
                          : 'bg-black/40 text-white opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>

                    {/* Info */}
                    <div className="p-1.5 bg-surface-elevated">
                      <p className="text-[9px] text-ink-tertiary truncate">{item.filename}</p>
                      {item.file_size && (
                        <p className="text-[8px] text-ink-tertiary/50">{formatSize(item.file_size)}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border-primary shrink-0">
          <div className="text-[10px] text-ink-tertiary">
            {filtered.length} file{filtered.length !== 1 ? 's' : ''}
            {selected && ' · 1 selected'}
          </div>
          <div className="flex items-center gap-2">
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1 mr-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="px-2 py-1 text-[10px] font-medium text-ink-secondary bg-surface-secondary rounded hover:bg-surface-tertiary disabled:opacity-30"
                >
                  Prev
                </button>
                <span className="text-[10px] text-ink-tertiary">{page}/{totalPages}</span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="px-2 py-1 text-[10px] font-medium text-ink-secondary bg-surface-secondary rounded hover:bg-surface-tertiary disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-ink-secondary bg-surface-secondary rounded-lg hover:bg-surface-tertiary"
            >
              Cancel
            </button>
            <button
              onClick={handleSelect}
              disabled={!selected}
              className="px-4 py-2 bg-accent-500 text-white text-xs font-bold rounded-lg hover:bg-accent-600 disabled:opacity-30 transition-colors"
            >
              Select
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

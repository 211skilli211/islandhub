import React from 'react';

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({ currentPage, totalPages, onPageChange }) => {
    // Basic logic to show limited page numbers if totalPages is huge
    // For now, simpler implementation
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - 2);
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center items-center mt-6 gap-2">
            <button
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:border-teal-500 hover:text-teal-600 transition-colors"
            >
                Previous
            </button>

            <div className="flex gap-1">
                {getPageNumbers().map(pageNum => (
                    <button
                        key={pageNum}
                        onClick={() => onPageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${currentPage === pageNum
                                ? 'bg-teal-600 text-white shadow-md shadow-teal-200'
                                : 'bg-white border border-slate-200 text-slate-600 hover:border-teal-500 hover:text-teal-600'
                            }`}
                    >
                        {pageNum}
                    </button>
                ))}
            </div>

            <button
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:border-teal-500 hover:text-teal-600 transition-colors"
            >
                Next
            </button>

            <span className="text-xs text-slate-400 font-medium ml-4">
                Page {currentPage} of {totalPages}
            </span>
        </div>
    );
};

export default PaginationControls;

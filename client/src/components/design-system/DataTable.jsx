import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, MoreVertical } from 'lucide-react';
import Button from './Button';

/**
 * Government Minimalism DataTable Component
 * Sections 15 & 58: Data-first layout, 56-64px rows, subtle borders, pagination
 */
export const DataTable = ({
  columns = [],
  data = [],
  keyField = 'id',
  loading = false,
  emptyMessage = 'No records found',
  emptyDescription,
  onRowClick,
  pagination = true,
  itemsPerPage = 10,
  className = '',
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Handle Sort
  const handleSort = (field) => {
    if (!field) return;
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortField) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal === bVal) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const comp = aVal > bVal ? 1 : -1;
      return sortDirection === 'asc' ? comp : -comp;
    });
  }, [data, sortField, sortDirection]);

  // Pagination calculations
  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const paginatedData = pagination
    ? sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : sortedData;

  const startRecord = (currentPage - 1) * itemsPerPage + 1;
  const endRecord = Math.min(currentPage * itemsPerPage, sortedData.length);

  return (
    <div className={`bg-white rounded-[8px] border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`px-4 py-3 text-xs font-semibold text-[#5F6B76] tracking-wider uppercase select-none ${
                    col.sortable ? 'cursor-pointer hover:text-[#17202A]' : ''
                  } ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${
                    col.headerClassName || ''
                  }`}
                  style={col.width ? { width: col.width } : undefined}
                >
                  <div className={`inline-flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : ''}`}>
                    <span>{col.label}</span>
                    {col.sortable && sortField === col.key && (
                      sortDirection === 'asc' ? (
                        <ChevronUp className="w-3.5 h-3.5 text-[#1F4E79]" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-[#1F4E79]" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E5E7EB] text-sm text-[#17202A]">
            {loading ? (
              // Minimal Skeleton Row
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="h-14">
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-4 py-3">
                      <div className="h-4 bg-[#E5E7EB] rounded-[4px] animate-pulse w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-[#5F6B76]">
                  <p className="font-medium text-sm text-[#17202A]">{emptyMessage}</p>
                  {emptyDescription && (
                    <p className="text-xs text-[#87919B] mt-1">{emptyDescription}</p>
                  )}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rIdx) => (
                <tr
                  key={row[keyField] || rIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`h-14 hover:bg-[#F8FAFC] transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((col, cIdx) => (
                    <td
                      key={col.key || cIdx}
                      className={`px-4 py-3 text-xs sm:text-sm ${
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                      } ${col.cellClassName || ''}`}
                    >
                      {col.render ? col.render(row[col.key], row, rIdx) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && !loading && sortedData.length > 0 && (
        <div className="px-4 py-3 border-t border-[#E5E7EB] bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#5F6B76]">
          <div>
            Showing <span className="font-semibold text-[#17202A]">{startRecord}</span> to{' '}
            <span className="font-semibold text-[#17202A]">{endRecord}</span> of{' '}
            <span className="font-semibold text-[#17202A]">{sortedData.length}</span> entries
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-[4px] border border-[#E5E7EB] bg-white text-[#17202A] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F1F3F6] transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2.5 py-1 text-xs font-medium text-[#17202A]">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-[4px] border border-[#E5E7EB] bg-white text-[#17202A] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F1F3F6] transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;

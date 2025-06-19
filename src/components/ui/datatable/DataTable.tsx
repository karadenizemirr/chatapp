"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  SearchIcon,
  FilterIcon,
  DownloadIcon,
  RefreshCwIcon,
} from "lucide-react";

export interface DataTableColumn<T = any> {
  key: string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: any;
  loading?: boolean;
  pagination?: boolean;
  pageSize?: number;
  searchable?: boolean;
  filterable?: boolean;
  exportable?: boolean;
  selectable?: boolean;
  onRowClick?: (row: T, index: number) => void;
  onSelectionChange?: (selectedRows: T[]) => void;
  className?: string;
  emptyMessage?: string;
}

export const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  pagination = true,
  pageSize = 10,
  searchable = true,
  filterable = false,
  exportable = false,
  selectable = false,
  onRowClick,
  onSelectionChange,
  className = "",
  emptyMessage = "Veri bulunamadı",
}: DataTableProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Filtreleme ve arama
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Arama
    if (searchTerm) {
      filtered = filtered.filter((row) =>
        columns.some((col) => {
          const value = row[col.key];
          return value
            ?.toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        })
      );
    }

    // Filtreler
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter((row) =>
          row[key]?.toString().toLowerCase().includes(value.toLowerCase())
        );
      }
    });

    return filtered;
  }, [data, searchTerm, filters, columns]);

  // Sıralama
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Sayfalama
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (key: string) => {
    const column = columns.find((col) => col.key === key);
    if (!column?.sortable) return;

    setSortConfig((current) => {
      if (current?.key === key) {
        return current.direction === "asc" ? { key, direction: "desc" } : null;
      }
      return { key, direction: "asc" };
    });
  };

  const handleRowSelect = (row: T, checked: boolean) => {
    const newSelection = checked
      ? [...selectedRows, row]
      : selectedRows.filter((r) => r !== row);

    setSelectedRows(newSelection);
    onSelectionChange?.(newSelection);
  };

  const handleSelectAll = (checked: boolean) => {
    const newSelection = checked ? [...paginatedData] : [];
    setSelectedRows(newSelection);
    onSelectionChange?.(newSelection);
  };

  const exportData = () => {
    const csv = [
      columns.map((col) => col.title).join(","),
      ...sortedData.map((row) =>
        columns.map((col) => row[col.key] || "").join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-3 border-b border-gray-100 bg-gray-50/50">
        <div className="flex flex-col lg:flex-row gap-2 justify-between items-start lg:items-center">
          {/* Search */}
          {searchable && (
            <div className="relative flex-1 max-w-sm">
              <SearchIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-secondary/20 focus:border-secondary/50 transition-all duration-200 bg-white"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-1.5">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-all duration-200"
            >
              <RefreshCwIcon className="w-3 h-3" />
              Yenile
            </button>
            {exportable && (
              <button
                onClick={exportData}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-green-500 text-white rounded-md hover:bg-green-600 transition-all duration-200"
              >
                <DownloadIcon className="w-3 h-3" />
                Dışa Aktar
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        {filterable && (
          <div className="mt-2 p-2 bg-white/60 rounded-md border border-gray-100">
            <div className="flex items-center gap-1.5 mb-1.5">
              <FilterIcon className="w-3 h-3 text-gray-500" />
              <span className="text-xs font-medium text-gray-700">Filtreler</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {columns
                .filter((col) => col.filterable)
                .map((col) => (
                  <div key={col.key} className="flex-1 min-w-24">
                    <input
                      type="text"
                      placeholder={`${col.title}...`}
                      value={filters[col.key] || ""}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          [col.key]: e.target.value,
                        }))
                      }
                      className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-secondary/20 focus:border-secondary/50 transition-all duration-200"
                    />
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {selectable && (
                <th className="px-3 py-2 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedRows.length === paginatedData.length &&
                      paginatedData.length > 0
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-gray-300 text-secondary focus:ring-1 focus:ring-secondary/20 transition-all duration-200"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-3 py-2 text-${
                    column.align || "left"
                  } text-xs font-semibold text-gray-800 ${
                    column.sortable
                      ? "cursor-pointer hover:bg-gray-100 transition-all duration-200 select-none"
                      : ""
                  }`}
                  style={{ width: column.width }}
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center gap-1 group">
                    <span className="group-hover:text-secondary transition-colors duration-200">{column.title}</span>
                    {column.sortable && (
                      <div className="flex flex-col opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                        <ChevronUpIcon
                          className={`w-2.5 h-2.5 transition-colors duration-200 ${
                            sortConfig?.key === column.key &&
                            sortConfig.direction === "asc"
                              ? "text-secondary"
                              : "text-gray-400"
                          }`}
                        />
                        <ChevronDownIcon
                          className={`w-2.5 h-2.5 -mt-0.5 transition-colors duration-200 ${
                            sortConfig?.key === column.key &&
                            sortConfig.direction === "desc"
                              ? "text-secondary"
                              : "text-gray-400"
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-3 py-8 text-center"
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-secondary/20 border-t-secondary mb-2"></div>
                    <span className="text-gray-600 text-xs">Yükleniyor...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-3 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                      <SearchIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <span className="text-gray-600 text-sm">{emptyMessage}</span>
                    <span className="text-gray-400 text-xs mt-1">Farklı arama deneyin</span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={index}
                  className={`hover:bg-gray-50 transition-all duration-200 group ${
                    onRowClick ? "cursor-pointer" : ""
                  } ${selectedRows.includes(row) ? "bg-secondary/5 border-l-2 border-secondary" : ""}`}
                  onClick={() => onRowClick?.(row, index)}
                >
                  {selectable && (
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleRowSelect(row, e.target.checked);
                        }}
                        className="w-3.5 h-3.5 rounded border-gray-300 text-secondary focus:ring-1 focus:ring-secondary/20 transition-all duration-200"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-3 py-2 text-xs text-gray-800 text-${
                        column.align || "left"
                      } group-hover:text-gray-900 transition-colors duration-200`}
                    >
                      {column.render
                        ? column.render(row[column.key], row, index)
                        : row[column.key] || <span className="text-gray-400">-</span>}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="px-3 py-2 border-t border-gray-100 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="text-xs text-gray-600">
              <span className="text-gray-800">{sortedData.length}</span> kayıttan{" "}
              <span className="text-secondary font-medium">
                {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, sortedData.length)}
              </span>{" "}
              arası
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              >
                ← Önceki
              </button>

              <div className="flex gap-0.5">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else {
                    if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                  }
                  
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-2 py-1 text-xs rounded transition-all duration-200 ${
                        currentPage === page
                          ? "bg-secondary text-white"
                          : "border border-gray-200 hover:bg-white text-gray-700"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              >
                Sonraki →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
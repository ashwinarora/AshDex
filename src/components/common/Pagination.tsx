"use client"
import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mt-5 space-y-3 md:space-y-0">
    {/* Pagination Controls */}
    <div className="flex flex-wrap justify-center md:justify-start items-center space-x-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded disabled:opacity-50"
      >
        &lt;
      </button>
  
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          onClick={() => onPageChange(i + 1)}
          className={`px-3 py-1 rounded ${
            currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-700"
          }`}
        >
          {i + 1}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded disabled:opacity-50"
      >
        &gt;
      </button>
    </div>
  
    <div className="flex items-center space-x-2 mt-3 md:mt-0">
      <span className="text-gray-400 text-sm">Rows per page:</span>
      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        className="px-2 py-1 bg-gray-700 text-white rounded"
      >
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={15}>15</option>
        <option value={20}>20</option>
      </select>
    </div>
  </div>  
  );
};

export default Pagination;

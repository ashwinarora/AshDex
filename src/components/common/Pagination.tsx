"use client";
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
    <div className="flex flex-col mx-2 md:flex-row justify-between items-center mt-5 space-y-3 md:space-y-0">
      {/* Pagination Controls */}
      <div className="flex flex-wrap justify-center md:justify-start items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 bg-[#1A0B35] text-white border-1 border-white/10 backdrop-blur-[40px] py-1 rounded-lg disabled:opacity-50"
          style={{
            background:
              "linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%)",
          }}
        >
          &lt;
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => onPageChange(i + 1)}
            className={`px-3 py-1 rounded-lg transition-all duration-200 ${
              currentPage === i + 1
                ? "bg-white text-black"
                : "bg-[#1A0B35] border-1 border-white/10 text-white"
            }`}
            style={
              currentPage === i + 1
                ? {} // Remove background gradient when active
                : {
                    background:
                      "linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%)",
                  }
            }
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 bg-[#1A0B35] border-1 text-white border-white/10 backdrop-blur-[40px] py-1 rounded-lg disabled:opacity-50"
          style={{
            background:
              "linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%)",
          }}
        >
          &gt;
        </button>
      </div>

      <div className="flex items-center space-x-2 mt-3 md:mt-0">
        <span className="text-[#8B8BA0] text-sm">Rows per page:</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="px-2 py-2 bg-[#1A0B35] border-1 border-white/10 backdrop-blur-[40px] text-white rounded-lg"
          style={{
            background:
              "linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%)",
          }}
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

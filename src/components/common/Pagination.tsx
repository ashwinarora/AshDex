'use client'
import React from 'react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  pageSize?: number
  onPageSizeChange?: (size: number) => void
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const renderPageNumbers = () => {
    const pages = []

    if (totalPages <= 4) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 2) {
        pages.push(1, 2, 3, '...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 1) {
        pages.push(1)
        pages.push('...')
        pages.push(totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1)
        pages.push(currentPage)
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages.slice(0, 5)
  }

  const handleSelectPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPage = parseInt(event.target.value, 10)
    if (!isNaN(selectedPage)) {
      onPageChange(selectedPage)
    }
  }
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
              'linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%)'
          }}
        >
          &lt;
        </button>

        {renderPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={`px-3 py-1 rounded-lg transition-all duration-200 ${
              currentPage === page
                ? 'bg-white text-black'
                : 'bg-[#1A0B35] border-1 border-white/10 text-white'
            }`}
            style={
              currentPage === page
                ? {}
                : {
                    background:
                      'linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%)'
                  }
            }
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 bg-[#1A0B35] border-1 text-white border-white/10 backdrop-blur-[40px] py-1 rounded-lg disabled:opacity-50"
          style={{
            background:
              'linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%)'
          }}
        >
          &gt;
        </button>
      </div>

      <div className="flex items-center space-x-2 mt-3 md:mt-0">
        <span className="text-[#8B8BA0] text-sm">Page</span>
        <select
          value={currentPage}
          onChange={handleSelectPageChange}
          className="px-2 py-2 bg-[#1A0B35] border-1 border-white/10 backdrop-blur-[40px] text-white rounded-lg"
          style={{
            background:
              'linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%)'
          }}
        >
          {Array.from({ length: totalPages }, (_, index) => (
            <option key={index + 1} value={index + 1}>
              {index + 1}
            </option>
          ))}
        </select>
        <span className="text-[#8B8BA0] text-sm">of {totalPages}</span>
      </div>
    </div>
  )
}

export default Pagination

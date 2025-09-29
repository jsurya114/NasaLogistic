// src/components/common/Pagination.jsx
import React from "react";

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null; // don't show pagination if only 1 page

  return (
    <div className="flex justify-center items-center gap-2 mt-8 mb-4">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className={`
          group relative inline-flex items-center px-5 py-2.5 text-sm font-semibold 
          rounded-lg border transition-all duration-200 ease-out transform
          ${page === 1
            ? "bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 hover:shadow-md hover:scale-[1.02]"
          }
        `}
      >
        <svg className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:-translate-x-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <span>Previous</span>
      </button>

      {/* Page Numbers */}
      <div className="flex gap-1">
        {[...Array(totalPages)].map((_, index) => {
          const pg = index + 1;
          return (
            <button
              key={pg}
              onClick={() => onPageChange(pg)}
              className={`
                group relative inline-flex items-center justify-center w-10 h-10 text-sm font-semibold 
                rounded-lg border transition-all duration-200 ease-out transform
                ${pg === page
                  ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/25 scale-105"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 hover:shadow-md hover:scale-[1.02]"
                }
              `}
            >
              <span className="relative">{pg}</span>
              {pg === page && (
                <div className="absolute inset-0 bg-white opacity-10 rounded-lg animate-pulse"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className={`
          group relative inline-flex items-center px-5 py-2.5 text-sm font-semibold 
          rounded-lg border transition-all duration-200 ease-out transform
          ${page === totalPages
            ? "bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 hover:shadow-md hover:scale-[1.02]"
          }
        `}
      >
        <span>Next</span>
        <svg className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}

export default Pagination;
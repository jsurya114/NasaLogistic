// src/components/common/Pagination.jsx
import React from "react";

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null; // don't show pagination if only 1 page

  return (
    <div className="flex justify-center items-center gap-2 mt-4">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className={`px-3 py-1 rounded border ${
          page === 1
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-white hover:bg-gray-100"
        }`}
      >
        Prev
      </button>

      {/* Page Numbers */}
      {[...Array(totalPages)].map((_, index) => {
        const pg = index + 1;
        return (
          <button
            key={pg}
            onClick={() => onPageChange(pg)}
            className={`px-3 py-1 rounded border ${
              pg === page
                ? "bg-purple-600 text-white"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            {pg}
          </button>
        );
      })}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className={`px-3 py-1 rounded border ${
          page === totalPages
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-white hover:bg-gray-100"
        }`}
      >
        Next
      </button>
    </div>
  );
}

export default Pagination;

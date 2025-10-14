import React from "react";

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-wrap justify-center items-center gap-2 mt-4">
      {/* Previous */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className={`group inline-flex items-center px-3 sm:px-5 py-1.5 sm:py-2 text-sm sm:text-base font-semibold 
                    rounded-md border transition-all duration-200 transform
                    ${page === 1
                      ? "bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200"
                      : "bg-white text-[#462976] border-[#462976]/30 hover:bg-[#462976] hover:text-white hover:border-[#462976] hover:shadow-lg hover:scale-[1.02]"
                    }`}
      >
        <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 transition-transform duration-200 group-hover:-translate-x-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <span>Prev</span>
      </button>

      {/* Page Numbers */}
      <div className="flex flex-wrap gap-1 justify-center">
        {[...Array(totalPages)].map((_, index) => {
          const pg = index + 1;
          return (
            <button
              key={pg}
              onClick={() => onPageChange(pg)}
              className={`inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 text-sm sm:text-base font-semibold rounded-md border transition-all duration-200 transform
                ${pg === page
                  ? "bg-[#462976] text-white border-[#462976] shadow-lg scale-105"
                  : "bg-white text-[#462976] border-[#462976]/30 hover:bg-[#462976]/10 hover:text-[#462976] hover:border-[#462976] hover:shadow-md hover:scale-[1.02]"
                }
              `}
            >
              {pg}
            </button>
          );
        })}
      </div>

      {/* Next */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className={`group inline-flex items-center px-3 sm:px-5 py-1.5 sm:py-2 text-sm sm:text-base font-semibold 
                    rounded-md border transition-all duration-200 transform
                    ${page === totalPages
                      ? "bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200"
                      : "bg-white text-[#462976] border-[#462976]/30 hover:bg-[#462976] hover:text-white hover:border-[#462976] hover:shadow-lg hover:scale-[1.02]"
                    }`}
      >
        <span>Next</span>
        <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 transition-transform duration-200 group-hover:translate-x-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}

export default Pagination;

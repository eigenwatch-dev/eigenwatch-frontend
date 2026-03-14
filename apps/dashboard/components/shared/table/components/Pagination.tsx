import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaGreaterThan,
  FaLessThan,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaChevronDown,
} from "react-icons/fa";
import BodyOne from "@/components/typography/BodyOne";

interface OffsetPagination {
  total: number;
  offset: number;
  limit: number;
}

export interface PaginationProps {
  pagination: OffsetPagination;
  onOffsetChange: (newOffset: number) => void;
  onLimitChange?: (newLimit: number) => void;
  isLoading?: boolean;
}

const Pagination = ({
  pagination,
  onOffsetChange,
  onLimitChange,
  isLoading = false,
}: PaginationProps) => {
  const { total, offset, limit } = pagination;
  const [pagesToShow, setPagesToShow] = useState<number[]>([]);
  const [showPageInput, setShowPageInput] = useState(false);
  const [pageInputValue, setPageInputValue] = useState("");
  const [showLimitDropdown, setShowLimitDropdown] = useState(false);

  // Calculate current page (1-based) and total pages
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  // Common page limits for selection
  const limitOptions = [5, 10, 20, 50, 100];

  useEffect(() => {
    const getPageNumbers = () => {
      const totalToShow = 5;

      if (totalPages <= totalToShow) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }

      let start = Math.max(1, currentPage - 2);
      let end = start + totalToShow - 1;

      if (end > totalPages) {
        end = totalPages;
        start = Math.max(1, end - (totalToShow - 1));
      }

      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    setPagesToShow(getPageNumbers());
  }, [currentPage, totalPages]);

  const handlePageChange = (page: number) => {
    const clampedPage = Math.max(1, Math.min(page, totalPages));
    const newOffset = (clampedPage - 1) * limit;
    onOffsetChange(newOffset);
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPage = parseInt(pageInputValue);
    if (!isNaN(targetPage) && targetPage >= 1 && targetPage <= totalPages) {
      handlePageChange(targetPage);
    }
    setPageInputValue("");
    setShowPageInput(false);
  };

  const handleLimitChange = (newLimit: number) => {
    if (onLimitChange) {
      onLimitChange(newLimit);
      // Reset to first page when changing limit
      onOffsetChange(0);
    }
    setShowLimitDropdown(false);
  };

  const skip5Pages = (direction: "forward" | "backward") => {
    const targetPage =
      direction === "forward"
        ? Math.min(currentPage + 5, totalPages)
        : Math.max(currentPage - 5, 1);
    handlePageChange(targetPage);
  };

  const startItem = Math.min(offset + 1, total);
  const endItem = Math.min(offset + limit, total);

  return (
    <motion.div
      className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:h-[48px] w-full bg-[#18181B4D] rounded-b-[4px] text-[#9F9FA9] py-2 sm:py-0 px-2 sm:px-0"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Results info and records per page */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="text-xs sm:text-sm">
          <BodyOne className="font-[600]">
            {startItem}-{endItem} of {total}
          </BodyOne>
        </div>

        {/* Records per page selector */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowLimitDropdown(!showLimitDropdown)}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded border border-white/10 hover:bg-gray-50/10 transition-colors"
            disabled={isLoading}
          >
            <span>{limit} per page</span>
            <motion.div
              animate={{ rotate: showLimitDropdown ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <FaChevronDown size="0.6rem" />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {showLimitDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full mb-1 left-0 border border-white/10 rounded shadow-lg z-10 min-w-[100px]"
              >
                {limitOptions.map((option) => (
                  <motion.button
                    key={option}
                    // whileHover={{ backgroundColor: "#f3f4f6" }}
                    onClick={() => handleLimitChange(option)}
                    className={`w-full px-3 py-2 text-left text-xs first:rounded-t bg-black border-white/10 last:rounded-b transition-colors ${
                      option === limit
                        ? "bg-blue-50/20 text-blue-600 font-medium"
                        : ""
                    }`}
                  >
                    {option} per page
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation controls */}
      <div className="flex items-center gap-1 py-[3px] rounded-[6px]">
        {/* First page */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => onOffsetChange(0)}
          disabled={currentPage === 1 || isLoading}
          className="px-2 py-1 rounded disabled:opacity-50 transition-colors"
          title="First page"
        >
          <FaAngleDoubleLeft size="0.75rem" />
        </motion.button>

        {/* Skip 5 pages backward */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => skip5Pages("backward")}
          disabled={currentPage <= 5 || isLoading}
          className="hidden sm:block px-2 py-1 rounded disabled:opacity-50 transition-colors text-xs"
          title="Skip 5 pages back"
        >
          -5
        </motion.button>

        {/* Previous page */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => onOffsetChange(offset - limit)}
          disabled={currentPage === 1 || isLoading}
          className="px-2 py-1 rounded disabled:opacity-50 transition-colors"
          title="Previous page"
        >
          <FaLessThan size="0.75rem" />
        </motion.button>

        {/* Page numbers */}
        {pagesToShow.map((pageNum) => (
          <motion.button
            key={pageNum}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => handlePageChange(pageNum)}
            disabled={isLoading}
            className={`px-3 py-1 rounded transition-colors duration-200 min-w-[32px] ${
              currentPage === pageNum
                ? "bg-primary shadow-sm"
                : "hover:bg-white/10"
            }`}
          >
            <BodyOne className="font-[600]">{pageNum}</BodyOne>
          </motion.button>
        ))}

        {/* Page jump input */}
        <div className="relative hidden sm:block">
          <AnimatePresence>
            {showPageInput ? (
              <motion.form
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                onSubmit={handlePageInputSubmit}
                className="flex items-center"
              >
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={pageInputValue}
                  onChange={(e) => setPageInputValue(e.target.value)}
                  onBlur={() => {
                    setTimeout(() => setShowPageInput(false), 150);
                  }}
                  autoFocus
                  className="w-16 px-2 py-1 text-xs border rounded text-center"
                  placeholder={currentPage.toString()}
                />
              </motion.form>
            ) : (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowPageInput(true)}
                disabled={isLoading}
                className="px-2 py-1 rounded transition-colors text-xs"
                title="Jump to page"
              >
                ...
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Next page */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => onOffsetChange(offset + limit)}
          disabled={currentPage === totalPages || isLoading}
          className="px-2 py-1 rounded disabled:opacity-50 transition-colors"
          title="Next page"
        >
          <FaGreaterThan size="0.75rem" />
        </motion.button>

        {/* Skip 5 pages forward */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => skip5Pages("forward")}
          disabled={currentPage >= totalPages - 4 || isLoading}
          className="hidden sm:block px-2 py-1 rounded disabled:opacity-50 transition-colors text-xs"
          title="Skip 5 pages forward"
        >
          +5
        </motion.button>

        {/* Last page */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => onOffsetChange((totalPages - 1) * limit)}
          disabled={currentPage === totalPages || isLoading}
          className="px-2 py-1 rounded disabled:opacity-50 transition-colors"
          title="Last page"
        >
          <FaAngleDoubleRight size="0.75rem" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Pagination;

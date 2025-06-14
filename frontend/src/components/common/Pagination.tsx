import React from 'react';
import './Pagination.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  size: number;
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalElements,
  size,
  onPageChange,
  onSizeChange
}) => {
  const getVisiblePages = () => {
    const visiblePages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) {
        visiblePages.push(i);
      }
    } else {
      if (currentPage <= 2) {
        visiblePages.push(0, 1, 2, '...', totalPages - 1);
      } else if (currentPage >= totalPages - 3) {
        visiblePages.push(0, '...', totalPages - 3, totalPages - 2, totalPages - 1);
      } else {
        visiblePages.push(0, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages - 1);
      }
    }
    
    return visiblePages;
  };

  const startItem = currentPage * size + 1;
  const endItem = Math.min((currentPage + 1) * size, totalElements);

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        <span>
          Showing {startItem}-{endItem} of {totalElements} items
        </span>
        <select 
          value={size} 
          onChange={(e) => onSizeChange(Number(e.target.value))}
          className="page-size-select"
        >
          <option value={6}>6 per page</option>
          <option value={12}>12 per page</option>
          <option value={24}>24 per page</option>
          <option value={48}>48 per page</option>
        </select>
      </div>
      
      <div className="pagination-controls">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="pagination-btn"
        >
          ← Previous
        </button>
        
        {getVisiblePages().map((page, index) => (
          <React.Fragment key={index}>
            {typeof page === 'number' ? (
              <button
                onClick={() => onPageChange(page)}
                className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
              >
                {page + 1}
              </button>
            ) : (
              <span className="pagination-ellipsis">{page}</span>
            )}
          </React.Fragment>
        ))}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
          className="pagination-btn"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default Pagination;

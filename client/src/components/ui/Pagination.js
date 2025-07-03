import React from 'react';
import './Pagination.css';

const Pagination = ({ 
    currentPage = 1, 
    totalPages = 1, 
    totalItems = 0, 
    itemsPerPage = 10, 
    onPageChange = () => {} 
}) => {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    
    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };
    
    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };
    
    const handlePageClick = (page) => {
        if (page !== currentPage) {
            onPageChange(page);
        }
    };
    
    const renderPageNumbers = () => {
        const pages = [];
        const showEllipsis = totalPages > 7;
        
        if (!showEllipsis) {
            // Show all pages if total pages <= 7
            for (let i = 1; i <= totalPages; i++) {
                pages.push(
                    <button
                        key={i}
                        className={`page-number ${i === currentPage ? 'active' : ''}`}
                        onClick={() => handlePageClick(i)}
                    >
                        {i}
                    </button>
                );
            }
        } else {
            // Show abbreviated pagination for more than 7 pages
            if (currentPage <= 4) {
                // Show first 5 pages, ellipsis, and last page
                for (let i = 1; i <= 5; i++) {
                    pages.push(
                        <button
                            key={i}
                            className={`page-number ${i === currentPage ? 'active' : ''}`}
                            onClick={() => handlePageClick(i)}
                        >
                            {i}
                        </button>
                    );
                }
                pages.push(<span key="ellipsis" className="page-ellipsis">...</span>);
                pages.push(
                    <button
                        key={totalPages}
                        className="page-number"
                        onClick={() => handlePageClick(totalPages)}
                    >
                        {totalPages}
                    </button>
                );
            } else if (currentPage >= totalPages - 3) {
                // Show first page, ellipsis, and last 5 pages
                pages.push(
                    <button
                        key={1}
                        className="page-number"
                        onClick={() => handlePageClick(1)}
                    >
                        1
                    </button>
                );
                pages.push(<span key="ellipsis" className="page-ellipsis">...</span>);
                for (let i = totalPages - 4; i <= totalPages; i++) {
                    pages.push(
                        <button
                            key={i}
                            className={`page-number ${i === currentPage ? 'active' : ''}`}
                            onClick={() => handlePageClick(i)}
                        >
                            {i}
                        </button>
                    );
                }
            } else {
                // Show first page, ellipsis, current-1, current, current+1, ellipsis, last page
                pages.push(
                    <button
                        key={1}
                        className="page-number"
                        onClick={() => handlePageClick(1)}
                    >
                        1
                    </button>
                );
                pages.push(<span key="ellipsis1" className="page-ellipsis">...</span>);
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(
                        <button
                            key={i}
                            className={`page-number ${i === currentPage ? 'active' : ''}`}
                            onClick={() => handlePageClick(i)}
                        >
                            {i}
                        </button>
                    );
                }
                pages.push(<span key="ellipsis2" className="page-ellipsis">...</span>);
                pages.push(
                    <button
                        key={totalPages}
                        className="page-number"
                        onClick={() => handlePageClick(totalPages)}
                    >
                        {totalPages}
                    </button>
                );
            }
        }
        
        return pages;
    };

    if (totalPages <= 1) {
        return (
            <div className="pagination-container">
                <div className="pagination-info">
                    Showing {totalItems} of {totalItems} entries
                </div>
            </div>
        );
    }

    return (
        <div className="pagination-container">
            <div className="pagination-info">
                Showing {startItem}-{endItem} of {totalItems} entries
            </div>
            <div className="pagination-controls">
                <button 
                    className={`pagination-arrow ${currentPage === 1 ? 'disabled' : ''}`}
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                >
                    &lt; Previous
                </button>
                <div className="page-numbers">
                    {renderPageNumbers()}
                </div>
                <button 
                    className={`pagination-arrow ${currentPage === totalPages ? 'disabled' : ''}`}
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                >
                    Next &gt;
                </button>
            </div>
        </div>
    );
};

export default Pagination; 
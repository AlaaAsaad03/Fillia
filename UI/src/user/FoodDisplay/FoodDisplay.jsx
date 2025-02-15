import React, { useState } from 'react';
import './FoodDisplay.css';
import FoodItem from '../FoodItem/FoodItem';
import { FaSearch } from 'react-icons/fa';

const FoodDisplay = ({ category, food_list, toggleBox, maxPrice, setMaxPrice, searchQuery, setSearchQuery }) => {
    const [sortOrder, setSortOrder] = useState("newest");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Number of items per page

    // Filter food list based on search query and max price
    const filteredFoodList = food_list.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        item.price <= maxPrice
    );

    // Sort filtered food list
    const sortedFoodList = filteredFoodList.sort((a, b) => 
        sortOrder === "newest" ? new Date(b.createdAt) - new Date(a.createdAt) : new Date(a.createdAt) - new Date(b.createdAt)
    );

    // Pagination logic
    const totalPages = Math.ceil(sortedFoodList.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedFoodList = sortedFoodList.slice(startIndex, startIndex + itemsPerPage);

    // Change page
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="food-display">
            <div className="search-filter-container">
                <div className="search-bar-container">
                    <FaSearch className="search-iconnn" />
                    <input 
                        type="text" 
                        placeholder="Search for Items by Name..." 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)}  
                        className="search-bar"
                    />
                </div>

                <div className="price-filter">
                    <label className='filter-label'>${maxPrice}</label>
                    <input 
                        type="range" 
                        min="1" 
                        max="800" 
                        value={maxPrice} 
                        onChange={(e) => setMaxPrice(Number(e.target.value))} 
                        className="price-slider"
                    />
                </div>

                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="cases-sort-select">
                    <option value="newest">Sort by Newest</option>
                    <option value="oldest">Sort by Oldest</option>
                </select>
            </div>
            
            <div className="food-display-list">
                {paginatedFoodList.length > 0 ? (
                    paginatedFoodList.map((item) => (
                        <FoodItem
                            key={item._id}
                            id={item._id}
                            name={item.name}
                            description={item.description}
                            price={item.price}
                            image={item.image}
                            quantity={item.quantity}
                            toggleBox={toggleBox}            
                        />
                    ))
                ) : (
                    <p>No items found.</p>
                )}
            </div>

           {/* Pagination Controls */}
<div className="pagination">
    <button className="page-button" disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}>← </button>
    
    {totalPages > 1 && (
        <>
            {currentPage > 2 && <button className="page-number" onClick={() => goToPage(1)}>1</button>}
            {currentPage > 3 && <span className="ellipsis">...</span>}
            
            {Array.from({ length: totalPages }, (_, index) => index + 1)
                .filter(page => 
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1)
                )
                .map(page => (
                    <button 
                        key={page} 
                        className={`page-number ${currentPage === page ? "active" : ""}`}
                        onClick={() => goToPage(page)}
                    >
                        {page}
                    </button>
                ))
            }

            {currentPage < totalPages - 2 && <span className="ellipsis">...</span>}
            {currentPage < totalPages - 1 && <button className="page-number" onClick={() => goToPage(totalPages)}>{totalPages}</button>}
        </>
    )}

    <button className="page-button" disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)}> →</button>
</div>

        </div>
    );
};

export default FoodDisplay;

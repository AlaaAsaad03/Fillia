import React from 'react';
import './FeaturedItems.css';

const FeaturedItems = () => (
    <div className="featured-items">
        <h2>Today's Highlights</h2>
        <div className="featured-list">
            {/* Sample content, replace with dynamic data */}
            <div className="featured-item">
                <img src="/path/to/image.jpg" alt="Item Name" />
                <p>Special Item 1</p>
            </div>
            <div className="featured-item">
                <img src="/path/to/image.jpg" alt="Item Name" />
                <p>Special Item 2</p>
            </div>
        </div>
    </div>
);

export default FeaturedItems;

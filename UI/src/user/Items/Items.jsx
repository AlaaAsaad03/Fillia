import React, { useState, useEffect, useContext } from 'react';
import ExploreMenu from '../ExploreMenu/ExploreMenu';
import FoodDisplay from '../FoodDisplay/FoodDisplay';
import { StoreContext } from '../context/StoreContext';
import GeneralLoader from '../../components/GeneralLoader/GeneralLoader';

import './Items.css'; 
import Footer from '../Footer/Footer';

const ItemsPage = ({ toggleBox }) => {
    const { fetchFoodList, food_list } = useContext(StoreContext);
    const [category, setCategory] = useState("All");
    const [subcategory, setSubcategory] = useState(null);
    const [foodList, setFoodList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [maxPrice, setMaxPrice] = useState(50);
    const [loadingCategory, setLoadingCategory] = useState(false);
    const [sortOrder, setSortOrder] = useState("newest");


    useEffect(() => {
        if (!subcategory) {
            fetchFoodList();
        }
    }, [subcategory]);

    useEffect(() => {
        if (!subcategory) {
            setFoodList(food_list);
        }
    }, [food_list, subcategory]);


    // Sort the foodList before passing it to FoodDisplay
    const sortedFoodList = [...foodList].sort((a, b) => {
        return sortOrder === "newest" 
            ? new Date(b.createdAt) - new Date(a.createdAt) 
            : new Date(a.createdAt) - new Date(b.createdAt);
    });

    return (
        <div className="items-page">
            <ExploreMenu 
                setCategory={setCategory} 
                setSubcategory={setSubcategory} 
                setFoodList={setFoodList} 
                setLoadingCategory={setLoadingCategory}
                
            /> {loadingCategory ? (
                <GeneralLoader message="Loading Items..." />
            ) : (
                <FoodDisplay
                category={category} 
                food_list={sortedFoodList}  // Pass sorted list to FoodDisplay
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                toggleBox={toggleBox}
            />
        )} 

        <Footer/>
        </div>
    );
};

export default ItemsPage;
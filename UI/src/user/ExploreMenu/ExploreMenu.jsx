import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { StoreContext } from '../context/StoreContext';
import './ExploreMenu.css';
import AnimatedText from './AnimatedText';

const ExploreMenu = ({ setCategory, setSubcategory, setFoodList, setLoadingCategory }) => {
    const { categories, fetchSubcategories, fetchItemsBySubcategory } = useContext(StoreContext);
    const [subcategories, setSubcategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    const [activeSubcategory, setActiveSubcategory] = useState(null);
    const [sortOrder, setSortOrder] = useState("newest");
    
    const handleCategorySelect = async (category) => {
        setLoadingCategory(true);
        if (activeCategory === category.name) {
            setCategory("All");
            setSubcategory(null);
            setActiveCategory(null);
            setSubcategories([]);
            setFoodList([]);
        } else {
            setCategory(category.name);
            setSubcategory(null);
            setActiveCategory(category.name);
            const fetchedSubcategories = await fetchSubcategories(category._id);
            setSubcategories(fetchedSubcategories);
            setFoodList([]);
        }
        setLoadingCategory(false);
    };

    const handleSubcategorySelect = async (subcategory) => {
        setLoadingCategory(true);
        setSubcategory(subcategory.name);
        setActiveSubcategory(subcategory._id);
        const items = await fetchItemsBySubcategory(subcategory._id);
        setFoodList(items);
        setLoadingCategory(false);
    };

    return (
        <div className="explore-menu">
             <motion.div className="title">
                <AnimatedText text="Join the Relief Effort" className='t1' />
                <AnimatedText text="Deliver Hope with Every Pack" className='t2' />
            </motion.div>

    
            {/* Categories Section */}
            <motion.div className="floating-category-bar" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
                {categories.length > 0 ? (
                    categories.map((category) => (
                        <motion.div
                            key={category._id}
                            onClick={() => handleCategorySelect(category)}
                            className={`floating-category ${activeCategory === category.name ? 'active' : ''}`}
                            whileHover={{ scale: 1.1 }}
                        >
                            <img src={`http://localhost:4000/uploads/${category.image}`} alt={category.name} className="category-image" />
                            <p className="category-name">{category.name}</p>
                        </motion.div>
                    ))
                ) : (
                    <p>No categories available</p>
                )}
            </motion.div>

            {subcategories.length > 0 && (
                <motion.div className="subcategories" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                    {subcategories.map((subcategory) => (
                        <motion.div
                            key={subcategory._id}
                            onClick={() => handleSubcategorySelect(subcategory)}
                            className={`subcategory-item ${activeSubcategory === subcategory._id ? 'active-subcategory' : ''}`}
                            whileHover={{ scale: 1.05 }}
                        >
                            <p>{subcategory.name}</p>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
};

export default ExploreMenu;
import React, { useContext, useState } from "react";
import { StoreContext } from "../context/StoreContext";
import { useAuthStore } from "../../context/authStore";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FaInfoCircle } from "react-icons/fa"; // FontAwesome Info Icon
import "./FoodItem.css";

const FoodItem = ({ id, name, price, description, image, onAddToCart, quantity, toggleBox }) => {
  const { cartItems, addToCart, removeFromCart, url } = useContext(StoreContext);
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [showTooltip, setShowTooltip] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleAddToCart = () => {
    if (isAuthenticated) {
        addToCart(id);
        if (toggleBox) toggleBox();  // Ensure toggleBox is defined before calling
        setIsAnimating(true);
        setTimeout(() => {
            setIsAnimating(false);
            toggleBox();
        }, 1000);
    } else {
        toast.error("You must log in to add items to the cart.", { duration: 3000 });
        setTimeout(() => {
            navigate(`/login?redirect=${window.location.pathname}`);
        }, 1500);
    }
};


  return (
    <div className={`food-item ${isAnimating ? 'animate' : ''} ${quantity === 0 ? 'food-item-sold-out' : ''}`}>
        <div className="food-item-content">
        <div className="food-item-header">
          <h2 className="food-item-name">{name}</h2>
          <p className="food-item-price">${price}</p>
        </div>

        <div className="food-item-image-container">
          <img className="food-item-image" src={`${url}/images/${image}`} alt={name} />
        </div>

        <div className="food-item-actions">
          <div className="info-icon-container" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
            <FaInfoCircle className="info-icon" />
            {showTooltip && <div className="tooltip">{description}</div>}
          </div>

          {quantity === 0 ? (
            <button className="food-item-sold-out-button" disabled>Sold Out</button>
          ) : !cartItems[id] ? (
            <div className="food-item-add-container">
              <span className="food-item-quantity">Available: {quantity - (cartItems[id] || 0)}</span>
              <button className="food-item-add-button" onClick={handleAddToCart}>Add to Box</button>
            </div>
          ) : (
            <div className="food-item-counter">
              <button className="counter-button" onClick={() => removeFromCart(id)}>-</button>
              <span className="counter-value">{cartItems[id]}</span>
              <button className="counter-button" onClick={() => addToCart(id)}>+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodItem;
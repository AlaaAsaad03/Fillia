import { useContext, useEffect } from 'react';
import './Cart.css';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';

const Cart = () => {
  const { food_list, cartItems, removeFromCart, getTotalCartAmount, url } = useContext(StoreContext);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);
  

  return (
    <div className="cart-container">
      <header className="cart-header">
        <h1 className="cart-title">Craft Your Care Package</h1>
      </header>
      <div className="cart-content">
        <div className="cart-items">
          {food_list.length === 0 ? (
            <div className="loader">Loading...</div>  // Add a simple loading indicator
          ) : (
            food_list.map((item) => {
              if (cartItems[item._id] > 0) {
                return (
                  <div key={item._id} className="cart-item">
                    <img src={`${url}/images/${item.image}`} alt={item.name} className="item-image" loading="lazy" />
                    <div className="item-detailss">
                      <h2>{item.name}</h2>
                      <p className="item-price">${item.price.toFixed(2)}</p>
                      <p className="item-quantity">Qty: {cartItems[item._id]}</p>
                    </div>
                    <div className="item-actions">
                      <button onClick={() => removeFromCart(item._id)} className="remove-buttonn" aria-label="Remove item from cart">
                        
                      </button>
                    </div>
                  </div>
                );
              }
              return null;
            })
          )}
        </div>
        <div className="cart-summary">
          <h2>Your Impact</h2>
          <div className="summary-details">
            <p>Subtotal:</p>
            <p>${getTotalCartAmount().toFixed(2)}</p>
          </div>
          <div className="summary-details">
            <p> Fee:</p>
            <p>${getTotalCartAmount() === 0 ? '0.00' : '2.00'}</p>
          </div>
          <div className="summary-total">
            <strong>Total:</strong>
            <strong>${getTotalCartAmount() === 0 ? '0.00' : (getTotalCartAmount() + 2).toFixed(2)}</strong>
          </div>
          <button onClick={() => navigate("/order")} className="checkoutt-button" aria-label="Proceed to checkout">
            Make a Difference
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;

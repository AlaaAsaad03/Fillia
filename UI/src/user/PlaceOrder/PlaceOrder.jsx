import React, { useContext, useEffect, useState } from 'react';
import './PlaceOrder.css';
import { StoreContext } from '../context/StoreContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PlaceOrder = () => {
    const { getTotalCartAmount, token, food_list, cartItems, url, userId } = useContext(StoreContext);
    const [data, setData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        street: "",
        city: "",
        state: "",
        zipcode: "",
        country: "",
        phone: ""
    });

    const onChangeHandler = (event) => {
        const { name, value } = event.target;
        setData(prevData => ({ ...prevData, [name]: value }));
    };

    const placeOrder = async (event) => {
        event.preventDefault();
        let orderItems = food_list.filter(item => cartItems[item._id] > 0).map(item => ({
            foodId: item._id, // Fix key name to match backend
            name: item.name,
            price: item.price,
            quantity: cartItems[item._id]
        }));

        let orderData = {
            userId: userId,
            address: data,
            items: orderItems,
            amount: getTotalCartAmount() + 2,
        };

        try {
            const response = await axios.post(`${url}/api/order/place`, orderData, { headers: { token } });
            if (response.data.success) {
                window.location.replace(response.data.session_url);
            } else {
                alert("Error placing the order.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while placing the order.");
        }
    };

    const navigate = useNavigate();

    useEffect(() => {
        if (!token || getTotalCartAmount() === 0) {
            navigate('/cart');
        }
    }, [token]);

    return (
        <form onSubmit={placeOrder} className='place-order'>
            <div className="place-order-left">
                <h2 className="title">Donation Information</h2>
                <div className="multi-fields">
                    <input required name='firstName' onChange={onChangeHandler} value={data.firstName} type="text" placeholder='First name' />
                    <input required name='lastName' onChange={onChangeHandler} value={data.lastName} type="text" placeholder='Last name' />
                </div>
                <input required name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Email address' />
                <input required name='street' onChange={onChangeHandler} value={data.street} type="text" placeholder='Street' />
                <div className="multi-fields">
                    <input required name='city' onChange={onChangeHandler} value={data.city} type="text" placeholder='City' />
                    <input required name='state' onChange={onChangeHandler} value={data.state} type="text" placeholder='State' />
                </div>
                <div className="multi-fields">
                    <input required name='zipcode' onChange={onChangeHandler} value={data.zipcode} type="text" placeholder='Zip code' />
                    <input required name='country' onChange={onChangeHandler} value={data.country} type="text" placeholder='Country' />
                </div>
                <input required name='phone' onChange={onChangeHandler} value={data.phone} type="text" placeholder='Phone' />
            </div>
            <div className="place-order-right">
                <div className="cart-total">
                    <h2>Cart Totals</h2>
                    <div className="cart-total-details">
                        <span>Subtotal</span>
                        <span>${getTotalCartAmount().toFixed(2)}</span>
                    </div>
                    <hr />
                    <div className="cart-total-details">
                        <span> Fee</span>
                        <span>${getTotalCartAmount() === 0 ? '0.00' : '2.00'}</span>
                    </div>
                    <hr />
                    <div className="cart-total-details total">
                        <b>Total</b>
                        <b>${(getTotalCartAmount() + 2).toFixed(2)}</b>
                    </div>
                    <button type='submit'>PROCEED TO PAYMENT</button>
                </div>
            </div>
        </form>
    );
};

export default PlaceOrder;
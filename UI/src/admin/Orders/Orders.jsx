import React, { useState, useEffect } from 'react';
import './Orders.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../../assets/assets';
import GeneralLoader from '../../components/GeneralLoader/GeneralLoader';

const OrderCard = ({ order }) => {
  return (
    <div className="order-card">
      <img src={assets.parcel_icon} alt="Parcel Icon" className="order-icon" />
      <div className="order-details">
        <p className="order-name">{`${order.address.firstName} ${order.address.lastName}`}</p>
        <p className="order-address">
          {`${order.address.street}, ${order.address.city}, ${order.address.state}, ${order.address.country} - ${order.address.zipcode}`}
        </p>
        <div className="order-items">
          <p><strong>Items:</strong></p>
          {order.items.map((item, idx) => (
            <span key={idx}>
              {item.name} x {item.quantity}
              {idx < order.items.length - 1 ? ', ' : ''}
            </span>
          ))}
        </div>
        <p className="order-amount"><strong>Total: ${order.amount.toFixed(2)}</strong></p>
      </div>
    </div>
  );
};

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const token = localStorage.getItem('token');
  let adminRole = '';

  if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    adminRole = payload.role;
  }

  const fetchAllOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${url}/api/order/list`);
      if (response.data.success) {
        setOrders(response.data.data);
        setFilteredOrders(response.data.data);  // Set the initial filtered orders
      } else {
        toast.error('Failed to fetch orders.');
      }
    } catch (error) {
      toast.error('An error occurred while fetching orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    const filtered = orders.filter((order) =>
      `${order.address.firstName} ${order.address.lastName}`
        .toLowerCase()
        .includes(e.target.value.toLowerCase())
    );
    setFilteredOrders(filtered);
  };

  const handleSort = (order) => {
    setSortOrder(order);
    const sorted = [...filteredOrders].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return order === 'newest' ? dateB - dateA : dateA - dateB;
    });
    setFilteredOrders(sorted);
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const isAuthorized = adminRole === 'Leader';

  return (
    <div className={`main-contentt ${!isAuthorized ? "blurred" : ""}`}>
      {!isAuthorized && (
        <div className="lock-overlay">
          <i className="lock-icon">🔒</i>
          <p>Access Restricted</p>
        </div>
      )}
      {loading && isAuthorized ? (
        <GeneralLoader message="Fetching Donations, hold on tight..." />
      ) : (
        isAuthorized && (
          <>
            <div className="search-and-filter">
            <div className="searchh-barr">
              <i className="search-iconn fas fa-search"></i>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder="Search By Name..."
                />
              </div>
              <div className="filter-buttonss">
                <button onClick={() => handleSort('newest')} className="filter-buttonn">Newest</button>
                <button onClick={() => handleSort('oldest')} className="filter-buttonn">Oldest</button>
              </div>
            </div>
            {filteredOrders.length > 0 ? (
              <div className="orders-container">
                {filteredOrders.map((order) => (
                  <OrderCard key={order._id} order={order} />
                ))}
              </div>
            ) : (
              <p className="no-orders">No orders found. Sit back and relax! 😊</p>
            )}
          </>
        )
      )}
    </div>
  );
};

export default Orders;

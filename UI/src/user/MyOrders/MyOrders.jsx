import React, { useContext, useEffect, useState } from 'react';
import './MyOrders.css';
import { StoreContext } from '../context/StoreContext';
import axios from 'axios';

const MyOrders = () => {
  const { url, token } = useContext(StoreContext);
  const [data, setData] = useState([]);

  const fetchOrders = async () => {
    const response = await axios.post(`${url}/api/order/userorders`, {}, { headers: { token } });
    setData(response.data.data);
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  return (
    <div className="my-orders-page">
      <h2 className='tt'>My Orders</h2>
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Total Amount</th>
              <th>Items</th>
            </tr>
          </thead>
          <tbody>
            {data.map((order, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>${order.amount}.00</td>
                <td>{order.items.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyOrders;
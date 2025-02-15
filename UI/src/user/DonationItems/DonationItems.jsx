import React, { useState, useEffect } from "react";
import axios from "axios";
import ItemForm from "../ItemForm/ItemForm"; // Import the form component
import "./DonationItem.css";

const DonationItems = () => {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const url = "http://localhost:4000";
  const [searchQuery, setSearchQuery] = useState("");

  const fetchItems = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/suggestion/my-suggestions", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setItems(response.data.suggestions);
    } catch (error) {
      console.error("Failed to fetch items:", error);
    }
  };

  useEffect(() => {
    fetchItems();
    const interval = setInterval(fetchItems, 60000); // Fetch every 5 seconds
    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  // Filter items based on search query
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="donation-items-page">
      <div className="searchh-barr">
      <i className="search-iconn fas fa-search"></i>
        <input
          type="text"
          placeholder="Search by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>
      <div
        className="background-blur"
        style={{
          backgroundImage: "url('./backg.png')",
        }}
      ></div>
      
      {showForm && (
        <div className="form-modal">
          <div className="form-modal-overlay" onClick={() => setShowForm(false)} />
          <div className="form-modal-content">
            <ItemForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}
      
      <div className="items-table-container">
        <table className="items-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Item Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item._id}>
                <td>
                  <img
                    src={`${url}/images/${item.image}`}
                    alt={item.name}
                    style={{ width: "50px", height: "50px", objectFit: "cover" }}
                  />
                </td>
                <td>{item.name}</td>
                <td>{item.description}</td>
                <td>${item.price}</td>
                <td>{item.quantity}</td>
                <td>
                  <span className={`status-button status-${item.status.toLowerCase()}`}>
                    {item.status}
                  </span>
                </td>          
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="button-container">
        <button className="add-itemm-button" onClick={() => setShowForm(true)}>
          Add Item
        </button>
      </div>
    </div>
  );
};

export default DonationItems;
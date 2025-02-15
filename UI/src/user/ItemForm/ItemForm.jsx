import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUtensils, FaMoneyBillWave, FaFileAlt, FaBoxes } from "react-icons/fa";
import { MdShoppingBag } from "react-icons/md";
import "./ItemForm.css";

const ItemForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    subcategoryId: "",
    image: null,
  });
  const [error, setError] = useState(null);
  const [subcategories, setSubcategories] = useState([]);

  const fetchSubcategories = async () => {
    try {
      const response = await axios.get(
        "http://localhost:4000/api/category/subcategories"
      );
      setSubcategories(response.data.data);
    } catch (error) {
      console.error("Failed to fetch subcategories", error);
      setError("Failed to fetch subcategories");
    }
  };

  useEffect(() => {
    fetchSubcategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("quantity", formData.quantity);
    formDataToSend.append("subcategoryId", formData.subcategoryId);
    formDataToSend.append("image", formData.image);
    try {
      const response = await axios.post(
        "http://localhost:4000/api/suggestion/add",
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("Your suggestion submitted successfully!");
      onClose();
    } catch (err) {
      console.error("Error submitting suggestion:", err);
    }
  };

  return (
    <div className="item-form-container">
     <button className="close-button" onClick={onClose}>X</button>
      {error && <p className="item-form-error">{error}</p>}
      <form onSubmit={handleSubmit} className="item-form">
        {/* Name and Quantity */}
        <div className="item-form-row">
          <div className="item-form-input-container">
            <MdShoppingBag className="item-form-icon" />
            <input
              type="text"
              name="name"
              className="item-form-input"
              placeholder="Item Name"
              onChange={handleChange}
              required
            />
          </div>
          <div className="item-form-input-container">
            <FaBoxes className="item-form-icon" />
             <input
              type="number"
              name="quantity"
              className="item-form-input"
              placeholder="Quantity"
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Price */}
        <div className="item-form-group">
        <div className="item-form-input-container">
            <input
              type="file"
              name="image"
              className="item-form-input"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
          </div>
        </div>

        {/* Upload and Category */}
        <div className="item-form-row">
        <div className="item-form-input-container">
            <FaMoneyBillWave className="item-form-icon" />
            <input
              type="number"
              name="price"
              className="item-form-input"
              placeholder="Price in $"
              onChange={handleChange}
              required
            />
            
          </div>
          <div className="item-form-input-container">
        <select
            name="subcategoryId"
            className="item-form-input" // This class will apply the styles
            value={formData.subcategoryId}
            onChange={handleChange}
            required
        >
            <option value=""> Subcategory</option>
            {subcategories.map((subcategory) => (
                <option key={subcategory._id} value={subcategory._id}>
                    {subcategory.name}
                </option>
            ))}
        </select>
        </div>
        </div>

        {/* Description */}
        <div className="item-form-group">
          <div className="item-form-input-container">
            <FaFileAlt className="item-form-icon" />
            <textarea
              name="description"
              className="item-form-textarea"
              placeholder="Description"
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="item-form-buttons">
          <button type="submit" className="btn add-itemm-button">
            Submit 
          </button>
        </div>
      </form>
    </div>
  );
};

export default ItemForm;

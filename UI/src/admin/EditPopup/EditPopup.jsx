import React, { useState } from 'react';
import './EditPopup.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const EditPopup = ({ isOpen, onClose, food, url, onEditSuccess }) => {
  const [formData, setFormData] = useState({
    name: food?.name || '',
    description: food?.description || '',
    price: food?.price || '',
    category: food?.category || '',
    image: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formDataObj = new FormData();
      formDataObj.append('id', food._id);
      formDataObj.append('name', formData.name);
      formDataObj.append('description', formData.description);
      formDataObj.append('price', formData.price);
      formDataObj.append('category', formData.category);

      if (formData.image) {
        formDataObj.append('image', formData.image);
      }

      const response = await axios.post(`${url}/api/food/update`, formDataObj);

      if (response.data.success) {
        toast.success(response.data.message);
        onEditSuccess(); // Refresh the list after edit
        onClose(); // Close the popup
      } else {
        toast.error('Error updating food');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error updating food');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h3>Edit Food Item</h3>
        <form onSubmit={handleSubmit}>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label>Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          ></textarea>

          <label>Price:</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
          />

          <label>Category:</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          />

          <label>Image:</label>
          <input
            type="file"
            name="image"
            onChange={handleFileChange}
          />

          <div className="popup-actions">
            <button type="submit" className="save-btn">
              Save
            </button>
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPopup;

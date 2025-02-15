

import React, { useState } from "react";
import axios from "axios";
import "./RequestWork.css";

const RequestWork = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await axios.post("http://localhost:4000/api/request/request-work", formData);
      setSuccess(response.data.message);
      setFormData({ name: "", email: "", phone: "", role: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Error submitting request.");
    }
  };

  return (
    <div className="popup-overlay-work">
      <div className="popup-container-work">
        <button className="close-icon-work" onClick={onClose}>×</button>
        <h2 className="work-h">Request Work</h2>
        <form onSubmit={handleSubmit} className="work-form">
          <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <input type="text" name="phone" placeholder="Phone (+961)" value={formData.phone} onChange={handleChange} required />
          <select name="role" value={formData.role} onChange={handleChange} required className="select-work">
            <option value="">Select Role</option>
            <option value="Delivery">Delivery</option>
            <option value="Packager">Packager</option>
          </select>
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
          <button type="submit" className="submit-btn-work">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default RequestWork;


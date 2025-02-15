import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUser, FaHeading, FaRegFileAlt, FaMoneyBillWave, FaListAlt, FaMapMarkerAlt,FaPhoneAlt,FaFileUpload,FaCalendarAlt    } from "react-icons/fa"; // Importing icons
import "./CreateCaseForm.css"; // Import the CSS file


export const ItemSelectPopup = ({ isOpen, onClose, onSelect, selectedItems }) => {
  const url = "http://localhost:4000";
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/food/list");
        setItems(response.data.data);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    if (isOpen) {
      fetchItems();
    }
  }, [isOpen]);

  const toggleSelect = (item) => {
    const isSelected = selectedItems.some((i) => i.id === item._id); // Use item._id here
    if (isSelected) {
      onSelect(selectedItems.filter((i) => i.id !== item._id)); // Use item._id here
    } else {
      onSelect([...selectedItems, { id: item._id, name: item.name, price: item.price }]); // Save only the item._id
    }
  };
  
  

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">     

      <div className="popup-content" role="dialog" aria-modal="true">
        
        <h2>Select Items</h2>
        <div className="items-list">
          {items.map((item) => (
           <div
           className={`item-card ${selectedItems.some((i) => i.id === item._id) ? "selected" : ""}`}
           key={item._id}
           onClick={() => toggleSelect(item)}
         >         
              <img src={`${url}/images/` + item.image} alt={item.name} />
              <span>{item.name}</span>
            </div>
          ))}
        </div>
        <div className="popup-buttons">
        <button className="closee-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};


const CreateCaseForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    description: "",
    salary: "",
    itemsNeeded: [],
    targetGroup: "",
    phoneNumber: "",
    urgency: "",               
    caseType: "",              
    deadline: "",   
    salaryImage: [],
    caseTypeImage: [],         
  });
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);


  const fetchLocation = async () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ latitude, longitude });
                try {
                    const response = await axios.get(
                        `http://localhost:4000/api/location/reverse?lat=${latitude}&lon=${longitude}`
                    );
                    setLocation({ latitude, longitude, address: response.data.display_name });
                } catch (error) {
                    console.error("Error fetching address:", error.message);
                    setError("Unable to retrieve address. Try again later.");
                }
            },
            (error) => {
                console.error("Error fetching location:", error.message);
                setError("Unable to retrieve location. Please enable location services.");
            }
        );
    } else {
        setError("Geolocation is not supported by this browser.");
    }
};

const handleFileChange = (e) => {
  const { name, files } = e.target;
  if (name === "deadline") {
    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
    if (value < today) {
      alert("Please select a future date for the deadline.");
      return;
    }
  }
  const fileArray = Array.from(files);
  setFormData((prev) => ({
    ...prev,
    [name]: fileArray, // Save the array of files
  }));
};


const handleSubmit = async (e) => {
  e.preventDefault();
  if (!location) {
    alert("Please allow location access to create a case.");
    return;
  }

  const cleanedItems = formData.itemsNeeded.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
  }));

  try {
    // Step 1: Create the case
    const response = await axios.post(
      "http://localhost:4000/api/cases/createcase/details",
      {
        ...formData,
        itemsNeeded: cleanedItems,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (response.status === 201) {
      const { caseId } = response.data; // Extract caseId from the response
      console.log("Case created successfully with ID:", caseId);

      // Step 2: Upload images
      const formDataImages = new FormData();
      formData.salaryImage.forEach((file) => formDataImages.append("salaryImage", file));
      formData.caseTypeImage.forEach((file) => formDataImages.append("caseTypeImage", file));

      await axios.post(`http://localhost:4000/api/cases/createcase/images/${caseId}`, formDataImages, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Case and images added successfully.");
      onClose(); // Close the form after success
    } else {
      alert("Error creating case.");
    }
  } catch (err) {
    console.error("Error:", err);
    alert("Error creating case or uploading images.");
  }
};

  


  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleItemSelect = (selectedItems) => {
    setFormData((prev) => ({
      ...prev,
      itemsNeeded: selectedItems,
    }));
  };
  

  return (
    <div className="case-form-containerr">
     <button className="close-buttoon" onClick={onClose}>X</button>

      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="formm">

  <div className="form-row">
    <div className="item-form-input-container">
      
      <FaUser className="item-form-icon" />
      <input
        type="text"
        name="name"
        className="item-form-input"
        placeholder="Name"
        onChange={handleChange}
        required
      />
    </div>
    <div className="item-form-input-container">
      <FaHeading className="item-form-icon" />
      <input
        type="text"
        name="title"
        placeholder="Title"
        onChange={handleChange}
        required
        className="item-form-input"
      />
    </div>
  </div>

  <div className="form-row">
    <div className="item-form-input-container">
      <FaMoneyBillWave className="item-form-icon" />
    <input
    type="number"
    name="salary"
    className="item-form-input"
    placeholder="Salary"
    onChange={handleChange}
    required
/>
    </div>
    <div className="item-form-input-container">
      <FaPhoneAlt className="item-form-icon" />
      <input
        type="text"
        name="phoneNumber"
        placeholder="Phone Number"
        onChange={handleChange}
        required
        className="item-form-input"
      />
    </div>
  </div>

  <div className="form-row">
    <div className="item-form-input-container">
      <FaListAlt className="item-form-icon" />
      <input
        type="text"
        name="itemsNeeded"
        className="item-form-input"
        value={formData.itemsNeeded.map((item) => item.name).join(", ")}
        placeholder="Select Items Needed"
        readOnly
        onClick={() => setIsPopupOpen(true)}
      />
    </div>
    <div className="item-form-input-container">
      <FaCalendarAlt className="item-form-icon" />
      <input
        type="date" 
        name="deadline"
        value={formData.deadline || ""}
        onChange={handleChange}
        required
        className="item-form-input"
      />
    </div>
  </div>

  <div className="item-form-group">
    <div className="item-form-input-container">
      <FaRegFileAlt className="item-form-icon" />
      <textarea
        name="description"
        className="item-form-textarea"
        placeholder="Description"
        onChange={handleChange}
        required
      />
    </div>
  </div>
  
  <div className="form-row">
  <div className="item-form-input-container">
    <select
      className="form-select"
      name="targetGroup"
      value={formData.targetGroup || ""}
      onChange={handleChange}
      required
    >
      <option value="" disabled>Select Target Group</option>
      <option value="children">Children</option>
      <option value="elderly">Elderly</option>
      <option value="families">Families</option>
      <option value="individuals">Individuals</option>
    </select>
  </div>

  <div className="item-form-input-container">
    <select
      name="urgency"
      className="form-select"
      value={formData.urgency || ""}
      onChange={handleChange}
      required
    >
      <option value="" disabled>Select Urgency</option>
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
    </select>
  </div>

  <div className="item-form-input-container">
    <select
      name="caseType"
      className="form-select"
      value={formData.caseType || ""}
      onChange={handleChange}
      required
    >
      <option value="" disabled>Select Case Type</option>
      <option value="medical">Medical</option>
      <option value="food">Food</option>
      <option value="housing">Housing</option>
      <option value="education">Education</option>
    </select>
  </div>
</div>
        <div className=" item-form-group">
        {formData.salary && (
  <div className="item-form-input-container">
    <FaFileUpload className="item-form-icon" />
    <input
      type="file"
      name="salaryImage"
      onChange={handleFileChange}
      accept="image/*"
      multiple // Allow multiple file uploads
      required
      className="item-form-input"
    />
  </div>
)}
</div>

{/* Case Type Image section */}
{formData.caseType === "medical" && (
  <div className="item-form-group">
    <div className="item-form-input-container">
      <FaFileUpload className="item-form-icon" />
      <input
        type="file"
        name="caseTypeImage"
        onChange={handleFileChange}
        accept="image/*"
        multiple // Allow multiple file uploads
        required
        className="item-form-input"
      />
    </div>
  </div>
)}
        <div className="form-buttons">
        <button type="button" className="btn location-btn" onClick={fetchLocation}>
        <FaMapMarkerAlt className="btnn-icon" />  Location
        </button>
        
        <button type="submit" className="btn add-itemm-button">
        Create Case
        </button>
        </div>
      </form>

      <ItemSelectPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onSelect={handleItemSelect}
        selectedItems={formData.itemsNeeded} // Pass selected items
      />

      {location && (
        <p className="location-display">
          Location: {location.address || `Latitude ${location.latitude}, Longitude ${location.longitude}`}
        </p>
      )}
    </div>
  );
};

export default CreateCaseForm;
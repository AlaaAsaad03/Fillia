import React, { useState, useEffect } from "react";
import { FaUser, FaEnvelope, FaTrashAlt, FaUpload, FaLock } from "react-icons/fa";
import { Eye, EyeOff } from "lucide-react"; 

import axios from "axios";
import "./Profile.css";
import { assets } from "../../assets/assets";

const Profile = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const token = localStorage.getItem("token");
  const payload = JSON.parse(atob(token.split(".")[1]));
  const userId = payload.id;
  const role = payload.role; // Assuming role is included in the JWT payload

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/profile/get", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (response.data.success) {
        const user = response.data.user;
        setName(user.name);
        setEmail(user.email);
        if (user.image) {
          setProfileImage(`http://localhost:4000/images/${user.image}`);
        } else {
          setProfileImage(assets.profile_icon2);
        }
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      alert("Failed to fetch profile data.");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
      setImageFile(file);
    }
  };

  const handleUpdateProfile = async () => {
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("name", name);
    formData.append("email", email);
    if (imageFile) formData.append("image", imageFile);

    try {
      const response = await axios.post("http://localhost:4000/api/profile/update", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.data.success) {
        alert("Profile updated successfully!");
        fetchProfile();
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await axios.delete("http://localhost:4000/api/profile/remove", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.data.success) {
        alert("Account deleted successfully.");
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account.");
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setErrorMessage("All fields are required.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }
    
    try {
      const response = await axios.post("http://localhost:4000/api/auth/change-password", {
        userId,
        role,
        currentPassword,
        newPassword,
        confirmNewPassword,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (response.data.success) {
        alert("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        setErrorMessage(response.data.message);
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setErrorMessage("Failed to change password.");
    }
  };
  return (
    <div className="user-profile-container">
    <div className="user-profile-header">
      <div className="user-profile-image-section">
        <img src={profileImage} alt="Profile" className="user-profile-image" />
        <div className="user-profile-image-buttons">
        <button 
          className="user-profile-upload-button" 
          onClick={() => document.getElementById("fileInput").click()}
        >
          <FaUpload className="user-profile-iconn" />
        </button>
        <input 
          id="fileInput"
          type="file" 
          accept="image/*" 
          onChange={handleImageChange} 
          style={{ display: "none" }} 
        />
        <button 
          className="user-profile-remove-button" 
          onClick={() => {
            setImageFile(null);
            setProfileImage(assets.profile_icon2); 
          }}
        >
          <FaTrashAlt className="user-profile-iconn" />
        </button>
        </div>
      </div>
  
      {/* Inputs with Icons - Moved below the image section */}
      <div className="user-profile-input-grid">
        <div className="input-container">
          <FaUser className="user-profile-icon" />
          <input
            type="text"
            placeholder="User Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="user-profile-input"
          />
        </div>
        <div className="input-container">
          <FaEnvelope className="user-profile-icon" />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="user-profile-input"
          />
        </div>
        <div className="input-container">
          <FaLock className="user-profile-icon" />
          <input
                type={showPassword ? "text" : "password"}
                placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="user-profile-input"
          />
           <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)} // Toggle show/hide password
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                > {showPassword ? <EyeOff  color="#acacac"/> : <Eye color="#acacac"/>}
                </button>
        </div>
        <div className="input-container">
          <FaLock className="user-profile-icon" />
          <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="user-profile-input"
          />
           <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)} // Toggle show/hide password
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                > {showPassword ? <EyeOff  color="#acacac"/> : <Eye color="#acacac"/>}
                </button>
        </div>
        <div className="input-container">
          <FaLock className="user-profile-icon" />
          <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm New Password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            className="user-profile-input"
          />
           <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)} // Toggle show/hide password
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                > {showPassword ? <EyeOff  color="#acacac"/> : <Eye color="#acacac"/>}
                </button>
        </div>
      </div>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  
    <div className="user-profile-action-buttons">
      <button className="user-profile-button user-profile-change-password-button" onClick={handleChangePassword}>
        Change Password
      </button>
      <button className="user-profile-button user-profile-save-changes" onClick={handleUpdateProfile}>
        Save Changes
      </button>
      <button className="user-profile-button user-profile-delete-account" onClick={handleDeleteAccount}>
        Delete Account
      </button>
    </div>
  </div>
  );
};

export default Profile;
import React, { useState, useEffect } from "react";
import { FaUser, FaEnvelope, FaKey, FaUpload, FaTrash } from "react-icons/fa";
import axios from "axios";
import "./AdminProfile.css";

const AdminProfile = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState('');
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const token = localStorage.getItem("token");

  let adminId = null;
  let adminRole = "";

  if (token) {
    const payload = JSON.parse(atob(token.split(".")[1]));
    adminId = payload.id;
    adminRole = payload.role;
  }

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/api/admin/details`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data && response.data.admin) {
        const { name, email, role, image } = response.data.admin;
        setName(name);
        setEmail(email);
        setRole(role);
        setProfileImage(image);
      }
    } catch (error) {
      console.error('Error fetching admin details:', error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
      setImageFile(file);
    }
  };

  const handleRemoveImage = async () => {
    try {
      const response = await axios.delete("http://localhost:4000/api/admin/remove-image", {
        headers: { Authorization: `Bearer ${token}` },
        data: { adminId },
      });
      if (response.data.success) {
        setProfileImage(null);
        alert("Image removed successfully.");
      } else {
        alert(response.data.message || "Failed to remove image.");
      }
    } catch (error) {
      console.error("Error removing image:", error);
      alert("An error occurred while removing the image.");
    }
  };

  const handleUpdateProfile = async () => {
    const formData = new FormData();
    formData.append("adminId", adminId);
    formData.append("name", name);
    formData.append("email", email);
    if (imageFile) formData.append("image", imageFile);

    try {
      const response = await axios.put(`http://localhost:4000/api/admin/update?adminId=${adminId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        alert("Profile updated successfully!");
        fetchProfile();
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Error updating profile', error);
      alert('Failed to update profile.');
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
      const response = await axios.post("http://localhost:4000/api/profile/change-password", {
        userId: adminId,
        role: adminRole,
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

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  return (
    <div className="main-contentt">
      <div className="admin-profile">
        <div className="profile-header">
          <div className="profile-left">
            <img src={profileImage || "./prfl.png"} alt="Admin" className="profile-image-admin" />

            <div className="upload-buttons">
              <label>
                <FaUpload className="icon2" />
                <input type="file" accept="image/*" onChange={handleImageChange} hidden />
              </label>
              <button type="button" onClick={handleRemoveImage}>
                <FaTrash className="icon3" />
              </button>
            </div>
            <p className="role">{role || "Role not set"}</p>

          </div>
          <div className="profile-right">
            <div className="update-form">
              <div className="input-group">
                <div className="input-item">
                  <input
                    type="text"
                    placeholder="User Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="profile-input"
                  />
                </div>
                <div className="input-item">
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="profile-input"
                  />
                </div>
              </div>
              <div className="input-group">
                <div className="input-item">
                  <input
                    type="password"
                    placeholder="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="profile-input"
                  />
                </div>
                <div className="input-item">
                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="profile-input"
                  />
                </div>
              </div>
              <div className="input-group">
                <div className="input-item">
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="profile-input"
                  />
                </div>
              </div>
              {errorMessage && <p className="error-message">{errorMessage}</p>}
            </div>
            <div className="action-buttons">
              <button className="submit-btn-prf" type="submit" onClick={handleUpdateProfile}>Save Changes</button>
              <button className="submit-btn-prf" type="button" onClick={handleChangePassword}>Change Password</button>
              <button className="delete-account-btn" type="button" onClick={handleDeleteAccount}>Delete Account</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminProfile;

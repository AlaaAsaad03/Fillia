import React, { useEffect, useState } from "react";
import axios from "axios";
import styled from 'styled-components';
import "./StaffManagement.css";
import { Eye, EyeOff } from "lucide-react"; 
import GeneralLoader from "../../components/GeneralLoader/GeneralLoader";

const Card = ({ admin, onUpdateRole, onDelete }) => {
  return (
    <StyledWrapper>
      <div className="card">
        <div className="card__img">
          <img src={admin.photo || './profile_icon2.png'} alt={admin.name} style={{ width: '100%', height: '100%', borderRadius: '20px 20px 0 0' }} />
        </div>
        <div className="card__avatar">
          <img src={admin.photo || './profile_icon2.png'} alt={admin.name} style={{ width: '100px', height: '100px', borderRadius: '50%' }} />
        </div>
        <div className="card__title">{admin.name}</div>
        <div className="card__subtitle">{admin.role}</div>
        <div className="card__wrapper">
          <select
            value={admin.role}
            onChange={(e) => onUpdateRole(admin.id, e.target.value)}
          >
            <option value="" disabled>Role</option>
            <option value="Leader">Leader</option>
            <option value="Packager">Packager</option>
            <option value="Delivery">Delivery</option>
          </select>
          <button className="card__btn" onClick={() => onDelete(admin.id)} style={{ marginLeft: '10px' }}>
            Delete
          </button>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .card {
    --main-color: #000;
    --submain-color: #78858F;
    --bg-color: #fff;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    position: relative;
    width: 300px;
    height: 384px;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-radius: 20px;
    background: var(--bg-color);
    margin: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .card__img {
    height: 192px;
    width: 100%;
    overflow: hidden;
    border-radius: 20px 20px 0 0;
  }

  .card__img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: blur(5px);
    transition: filter 0.3s ease;
  }

  .card__avatar {
    position: absolute;
    width: 114px;
    height: 114px;
    background: var(--bg-color);
    border-radius: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    top: calc(50% - 57px);
  }

  .card__wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-top: 15px;
  }

  .card__title {
    margin-top: 60px;
    font-weight: 500;
    font-size: 18px;
    color: var(--main-color);
  }

  .card__subtitle {
    margin-top: 10px;
    font-weight: 400;
    font-size: 15px;
    color: var(--submain-color);
  }

  .card__btn,
  select {
    margin: 0;
    width: 76px;
    height: 31px;
    border: 2px solid tomato;
    border-radius: 4px;
    font-weight: 700;
    font-size: 11px;
    color: #003c71;
    background: var(--bg-color);
    text-transform: uppercase;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    box-sizing: border-box;
  }

  select {
    padding: 0 5px;
  }

  .card__btn:hover,
  select:hover {
    background-color: red;
    transform: translateY(-1px);
  }

  .card__btn:active,
  select:active {
    transform: translateY(0);
  }

  select:hover {
    background-color: transparent;
    color: #003c71;
  }
`;

const StaffManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  let adminRole = "";
  const token = localStorage.getItem("token");
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (token) {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const adminId = payload.id;
    adminRole = payload.role;
    console.log("adminId", adminId);
    console.log("adminRole", adminRole);
  }

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/admin/all");
        setAdmins(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching admins:", error);
        setLoading(false);
      }
    };
    fetchAdmins();
  }, []);

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    console.log("Adding admin:", newAdmin);
    try {
      await axios.post("http://localhost:4000/api/admin/add", newAdmin, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const response = await axios.get("http://localhost:4000/api/admin/all");
      setAdmins(response.data.data);
      setNewAdmin({ name: "", email: "", password: "", role: "" });
    } catch (error) {
      console.error("Error adding admin:", error);
    }
  };

  const handleUpdateRole = async (adminId, newRole) => {
    try {
      await axios.put("http://localhost:4000/api/admin/update-role", {
        adminId,
        newRole,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const response = await axios.get("http://localhost:4000/api/admin/all");
      setAdmins(response.data.data);
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    try {
      await axios.delete(`http://localhost:4000/api/admin/remove/${adminId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const response = await axios.get("http://localhost:4000/api/admin/all");
      setAdmins(response.data.data);
    } catch (error) {
      console.error("Error deleting admin:", error);
    }
  };

  const isAuthorized = adminRole === "Leader";

  return (
    <div className={`main-contentt ${!isAuthorized ? "blurred" : ""}`}>
      {!isAuthorized && (
        <div className="lock-overlay">
          <i className="lock-icon">🔒</i>
          <p>Access Restricted</p>
        </div>
      )}
      {loading && isAuthorized ? (
        <GeneralLoader message="Assembling your team of changemakers..." />
      ) : (
        isAuthorized && (
          <>
            <section className="admin-list">
              <div className="admin-header">
                <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                  Add Admin
                </button>
              </div>
              <div className="admin-cards">
                {admins.map((admin) => (
                  <Card
                    key={admin.id}
                    admin={admin}
                    onUpdateRole={handleUpdateRole}
                    onDelete={handleDeleteAdmin}
                  />
                ))}
              </div>
            </section>

            {/* Modal for adding admin */}
            {isModalOpen && (
              <Modal>
                <form onSubmit={handleAddAdmin}>
                  <div className="form-group"style={{ marginTop: "20px" }}>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={newAdmin.name}
                      onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={newAdmin.email}
                      onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={newAdmin.password}
                      onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                      required
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                  <div className="form-group">
                    <select
                      value={newAdmin.role}
                      onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                      required
                    >
                      <option value="">Select Role</option>
                      <option value="Leader">Leader</option>
                      <option value="Packager">Packager</option>
                      <option value="Delivery">Delivery</option>
                    </select>
                  </div>
                  <div className="modal-buttons">
  <button type="submit" className="btn-submit">
    Add Admin
  </button>
  <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>
    Cancel
  </button>
</div>

                </form>
              </Modal>
            )}
          </>
        )
      )}
    </div>
  );
};

const Modal = ({ children, onClose }) => {
  return (
    <Overlay>
      <ModalContainer>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        {children}
      </ModalContainer>
    </Overlay>
  );
};

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 15px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.3);
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
`;

export default StaffManagement;
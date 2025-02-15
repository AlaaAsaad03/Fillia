import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import GeneralLoader from "../../components/GeneralLoader/GeneralLoader";
import { assets } from "../../assets/assets";
import "./Users.css";

export const Users = ({ url }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [filteredUsers, setFilteredUsers] = useState([]); // State for filtered list

  const token = localStorage.getItem("token");
  let adminRole = "";

  if (token) {
    const payload = JSON.parse(atob(token.split(".")[1])); // Decodes the payload part of the JWT
    adminRole = payload.role;
    console.log("adminRole", adminRole);
  }

  const fetchUsers = async () => {
    setLoading(true); // Set loading to true before fetching
    try {
      const response = await axios.get(`${url}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`, // Add token to the headers
        },
      });
      if (response.data.success) {
        setUsers(response.data.users);
        setFilteredUsers(response.data.users); // Set initial filtered list
      } else {
        toast.error("Error");
      }
    } catch (error) {
      toast.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter the list based on search query
    if (query === "") {
      setFilteredUsers(users); // Show all users if no search query
    } else {
      setFilteredUsers(
        users.filter(
          (user) =>
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
        )
      );
    }
  };

  const handleSort = (order) => {
    const sortedUsers = [...filteredUsers].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return order === "newest" ? dateB - dateA : dateA - dateB;
    });
    setFilteredUsers(sortedUsers);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const isAuthorized = adminRole === "Leader"; // Check if the user is an admin

  return (
    <div className={`main-contentt ${!isAuthorized ? "blurred" : ""}`}>
      {!isAuthorized && (
        <div className="lock-overlay">
          <i className="lock-icon">🔒</i>
          <p>Access Restricted</p>
        </div>
      )}
      {loading && isAuthorized ? (
        <GeneralLoader message="Fetching user data..." />
      ) : (
        isAuthorized && (
          <div className="user-listt flex-col">

<div className="header-bar">
                        <div className="search-and-filter">
            <div className="searchh-barr">
              <i className="search-iconn fas fa-search"></i>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder="By Name or Date..."
                />
              </div>
              <div className="filter-buttonss">
                <button onClick={() => handleSort('newest')} className="filter-buttonn">Newest</button>
                <button onClick={() => handleSort('oldest')} className="filter-buttonn">Oldest</button>
              </div>
            </div>
                
                        </div>

            <div className="listt-tablee">
              <div className="list-table-format title">
                
                <b>Profile</b>
                <b>Name</b>
                <b>Email</b>
                <b>Joined At</b>
                <b>#</b>

              </div>
              {filteredUsers.map((user, index) => (
                <div key={index} className="list-table-format">
                  <img
                    src={
                      user.image
                        ? `${url}/images/` + user.image
                        : "/profile_icon2.png"
                    }
                    alt="Profile"
                    className="user-profile-image"
                  />
                  <p>{user.name}</p>
                  <p>{user.email}</p>
                  <p>{new Date(user.createdAt).toLocaleDateString('en-GB').replace(/\//g, '-')}</p>
                  <p>{index + 1}</p>

                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default Users;

import React, { useState, useEffect } from "react";
import '@fortawesome/fontawesome-free/css/all.min.css';
import "./AdminMessagingPage.css";
import axios from "axios";
import { io } from "socket.io-client";
import { FaRegUser, FaPaperPlane, FaComments } from 'react-icons/fa';
import { assets } from "../../assets/assets";

const socket = io("http://localhost:4000");

const AdminMessagingPage = () => {
      const [users, setUsers] = useState([]);
      const [messages, setMessages] = useState([]);
      const [messageContent, setMessageContent] = useState("");
      const [typing, setTyping] = useState(false);
      const [typingTimeout, setTypingTimeout] = useState(null);
      const [groupName, setGroupName] = useState("");
      const [selectedMembers, setSelectedMembers] = useState([]);
      const [groupImage, setGroupImage] = useState(null);
      const [groups, setGroups] = useState([]);
      const [showCreateGroup, setShowCreateGroup] = useState(false);
      const [searchQuery, setSearchQuery] = useState("");
      const [isSearchVisible, setIsSearchVisible] = useState(false);
      const [showAddUserModal, setShowAddUserModal] = useState(false);
      const [groupUsers, setGroupUsers] = useState([]);
      const displayedUsersCount = users.length;
      const [userMessages, setUserMessages] = useState([]);
      const [groupMessages, setGroupMessages] = useState({ senderMessages: [], receiverMessages: [] });
      const [selectedUser, setSelectedUser] = useState(null);
      const [selectedGroup, setSelectedGroup] = useState(null);
      const [senderColors, setSenderColors] = useState({});


        const url = "http://localhost:4000";
        let adminId = null;
        let adminRole = "";
        const token = localStorage.getItem("token");
        console.log("Token",token);
        let type = null;

      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
          adminId = payload.id;
          adminRole = payload.role;

          if (!adminId) {
            console.error("Admin ID is missing from the token.");
          }
        } catch (error) {
          console.error("Invalid token format:", error);
        }
      }

    // Fetch groups
    useEffect(() => {
      const fetchGroups = async () => {
        try {
          const response = await axios.get(`${url}/api/chat/groups`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setGroups(response.data.groups);
        } catch (error) {
          console.error("Error fetching groups:", error);
        }
      };

      fetchGroups();
    }, [token]);

    useEffect(() => {
      const fetchUsers = async () => {
        try {
          const response = await axios.get(`${url}/api/chat/users`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            Accept: "application/json",
          }); // Fetch all users
          const usersWithStatus = await Promise.all(
            response.data.users.map(async (user) => {
              const statusResponse = await axios.get(
                `${url}/api/chat/status-user/${user._id}`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );
              return {
                ...user,
                isOnline: statusResponse.data.data.isOnline,
                lastSeen: statusResponse.data.data.lastSeen,
              };
            })
          ); // Fetch leaders
          setUsers(usersWithStatus);
          console.log("response users", usersWithStatus);
        } catch (error) {
          console.error("Error fetching admins:", error);
        }
      };
      fetchUsers();
      

      socket.on("messageStatus", ({ messageId, status }) => {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === messageId ? { ...msg, status: status } : msg
          )
        );
      });

      if (selectedUser) {
        socket.emit("joinRoom", {
          senderId: adminId,
          receiverId: selectedUser._id,
        });
      

        // Mark all messages as read
        axios.patch(
          `${url}/api/chat/read`,
          { senderId: selectedUser._id, receiverId: adminId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        return () => {
          // Leave the chat room when the component unmounts
          socket.emit("leaveRoom", { senderId: adminId });
        };
      }

      socket.on("messagesRead", ({ receiverId }) => {
        if (selectedUser._id === receiverId) {
          setMessages((prevMessages) =>
            prevMessages.map((msg) => ({ ...msg, isRead: true }))
          );
        }
      });

      socket.on("setOnline", async (data) => {
        const { userId: onlineAdminId } = data;
        // Add logic to update online status if necessary
        if (onlineAdminId === adminId) {
          // Replace with actual admin ID
          console.log(`Admin ${onlineAdminId} marked online.`);
        }
      });

      // Mark admin as online when component mounts
      socket.emit("setOnline", { userId: adminId, role: "Leader" }); // Replace with actual admin ID

      // Socket event for receiving messages
      socket.on("receiveMessage", (message) => {
        assignColorToSender(message.sender); 
        console.log("Message received:", message);
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      // Socket event for typing indication
      const handleTyping = () => {
        socket.emit("typing", {
          senderId: adminId, // Admin's ID
          receiverId: selectedUser._id,
        });
        
        // Only set the typing state for others
        if (typingTimeout) clearTimeout(typingTimeout);
        setTyping(true);
        setTypingTimeout(setTimeout(() => setTyping(false), 2000));
      };
      
      // Socket event listener for typing
      socket.on("typing", ({ senderId }) => {
        if (senderId !== adminId) { // Check if the sender is not the current admin
          setTyping(true);
          setTimeout(() => setTyping(false), 3000); // Clear typing after 3 seconds
        }
      });

      return () => {
        socket.emit("customDisconnect", { userId: adminId, role: "Leader" }); // Replace with actual admin ID
        socket.off("receiveMessage");
        socket.off("typing");
        socket.off("setOnline");
        socket.emit("leaveRoom", { senderId: adminId });
        socket.off("messageStatus");
      };
    }, [adminId, selectedUser]);

    const acceptChat = async (user) => {
      setSelectedUser(user);
      const response = await axios.get(
          `${url}/api/chat/messages?receiverId=${user._id}`,
          {
              headers: {
                  Authorization: `Bearer ${token}`,
              },
          }
      );
  
      setMessages(response.data.messages);
      console.log("Fetched Messages:", response.data.messages);
  };

  const acceptGroupChat = async (group) => {
    setSelectedUser(group);
    try {
      const response = await axios.get(
        `${url}/api/chat/messages-group?receiverId=${group._id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const { groupedMessages } = response.data;
        setMessages(groupedMessages); // Save grouped messages directly
      } else {
        console.error("Failed to fetch group messages:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching group messages:", error);
    }
};
  
    const sendMessage = async () => {
      socket.emit("sendMessage", {
        senderId: adminId,
        receiverId: selectedUser._id,
        content: messageContent,
        isRead: false,
      });
      setMessageContent("");
    };

    const handleTyping = () => {
      socket.emit("typing", {
        senderId: adminId, // Replace with actual admin ID
        receiverId: selectedUser._id,
      });
      if (typingTimeout) clearTimeout(typingTimeout);
      setTyping(true);
      setTypingTimeout(setTimeout(() => setTyping(false), 2000));
    };

    const searchMessages = async (query) => {
      try {
        const response = await axios.get(`${url}/api/chat/search?query=${query}`, {
          headers: {
            "Content-Type": "application/json",
            // Include your authentication token if needed
            Authorization: `Bearer ${token}`, // Replace with actual token if required
          },
          data: { userId: adminId }, // Replace with actual user ID
        });

        if (response.data.success) {
          // Assuming you have a state to hold searched messages
          setMessages(response.data.messages); // Update messages state with the search results
        } else {
          console.error("Search failed:", response.data.message);
        }
      } catch (error) {
        console.error("Error searching messages:", error);
      }
    };

    const handleSearch = (e) => {
      setSearchQuery(e.target.value);
      if (e.target.value.length > 2) {
        // Start searching after 2 characters
        searchMessages(e.target.value);
      }
    };

    const fetchNonGroupUsers = async (groupId) => {
      try {
        const response = await axios.get(`${url}/api/chat/non-group-users/${groupId}`);
        setGroupUsers(response.data.users);
      } catch (error) {
        console.error("Error fetching non-group users:", error);
      }
    };

    const openAddUserModal = (group) => {
      setSelectedGroup(group);
      fetchNonGroupUsers(group._id);
      setShowAddUserModal(true);
    };

    const addUserToGroup = async (userId) => {
      try {
        const response = await axios.post(
          `${url}/api/chat/addUserToGroup`,
          { groupId: selectedGroup._id, userId },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
  
        if (response.data.success) {
          alert("User added successfully!");
          setShowAddUserModal(false);
          // Refresh groups to reflect changes
          const updatedGroups = groups.map((group) =>
            group._id === selectedGroup._id ? response.data.group : group
          );
          setGroups(updatedGroups);
        } else {
          alert(response.data.message);
        }
      } catch (error) {
        console.error("Error adding user to group:", error);
        alert("Failed to add user to the group.");
      }
    };

    const createGroup = async () => {
      if (!groupName || selectedMembers.length === 0) {
        alert("Group name and members are required.");
        return;
      }
  
      const formData = new FormData();
      formData.append("name", groupName);
      formData.append("createdBy", adminId);
      formData.append("members", JSON.stringify(selectedMembers)); // Serialize members array
      if (groupImage) {
        formData.append("image", groupImage);
      }
  
      console.log(selectedMembers);
  
      try {
        const response = await axios.post(
          `${url}/api/chat/create-group`,
          formData, // Send group name and members
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          } // Include auth token
        );
  
        if (response.data.success) {
          alert("Group created successfully!");
          setGroups([...groups, response.data.group]);
          setShowCreateGroup(false);
          setGroupName("");
          setGroupImage(null);
          setSelectedMembers([]);
        } else {
          alert(response.data.message);
        }
      } catch (error) {
        console.error("Error creating group:", error);
        alert("Failed to create group.");
      }
    };

    const handleGroupSelect = (group) => {
      setSelectedGroup(group);
      acceptGroupChat(group); // Call the function to fetch group messages
  };

  // Function to generate a random color
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Function to assign a color to a sender and persist it
const assignColorToSender = (senderId) => {
  setSenderColors((prevColors) => {
    if (!prevColors[senderId]) {
      const newColor = getRandomColor();
      return { ...prevColors, [senderId]: newColor };
    }
    return prevColors;
  });
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
      <div className="messaging-container">
      <div className="user-group-section">
        <div className="user-container">
          <h3 className="list-title">Users</h3>
          <div className="user-list">
            {users.map((user) => (
              <div key={user._id} className="user-profile" onClick={() => acceptChat(user)}>
                <img src={user.image ? `${url}/images/${user.image}` : assets.profile_icon2} alt={user.name} className="user-avatar" />  
                  <div className="user-info">
                  <p className="user-name">{user.name}</p>
                  <p className={`user-status ${user.isOnline ? 'online' : 'offline'}`}>
                    {user.isOnline ? 'Online' : `Last seen: ${new Date(user.lastSeen).toLocaleString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}`}
                  </p>
                </div>
                <i className="fas fa-comment-dots" onClick={() => acceptChat(user)}></i>
              </div>
            ))}
          </div>
          </div>
          <div className="group-conatainer">
          <h3 className="list-title">Groups</h3>
          <div className="group-list">
            {groups.map((group) => (
              <div key={group._id} className="group-profile" onClick={() => acceptGroupChat(group)}>
              <img src={group.image ?`${url}/images/${group.image}`:assets.NewLogo} alt={group.name} className="group-avatar" />
              <div className="group-info">
                <p className="group-name">{group.name}</p>
              </div>
              <i className="fas fa-user-plus chat-icon" onClick={() => openAddUserModal(group)}></i>
              <i className="fas fa-comments chat-icon" onClick={() => acceptGroupChat(group)}></i>
            </div>
            ))}
          </div>
          </div>
          <div className="add-group-container" onClick={() => setShowCreateGroup(!showCreateGroup)}>
          <i className="fas fa-plus-circle" style={{ fontSize: '1.5rem' }}></i>
          <span style={{ marginLeft: '10px', fontSize: '1.2rem' }}>
            {showCreateGroup ? "Close" : "Create Group"}
          </span>
        </div>

    {showCreateGroup && (
      <div className="create-group-popup">
        <div className="popup-backdrop" onClick={() => setShowCreateGroup(false)}></div>
        <div className="popup-container">
          <div className="popup-header">
            <h2>Create New Group</h2>
            <button
              className="close-button"
              onClick={() => setShowCreateGroup(false)}
              aria-label="Close"
            >
              &times;
            </button>
          </div>
          <form className="group-form" onSubmit={(e) => {
            e.preventDefault();
            createGroup();
          }}>
            <div className="form-group">
              <label>Group Name</label>
              <input
                type="text"
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Group Image</label>
              <input
                type="file"
                onChange={(e) => setGroupImage(e.target.files[0])}
                required
              />
            </div>
            <div className="form-group">
              <label>Select Members</label>
              <div className="member-list">
                {users.map((user) => (
                  <div key={user._id} className="member-item">
                    <img src={user.image ? `${url}/images/${user.image}` : assets.profile_icon2}                       alt={assets.user1}
                      className="member-avatar"
                    />
                    <span className="member-name">{user.name}</span>
                    <input
                      type="checkbox"
                      value={user._id}
                      checked={selectedMembers.includes(user._id)}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSelectedMembers((prev) =>
                          e.target.checked
                            ? [...prev, value]
                            : prev.filter((id) => id !== value)
                        );
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
        <div className="form-actions">
          <button type="submit" className="create-btn">Create</button>
          <button
            type="button"
            className="cancel-btn"
            onClick={() => setShowCreateGroup(false)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
      )}

        </div>
        {showAddUserModal && (
        <div className="modal">
          <div className="modal-content add-user-popup">
          <div className="popup-header">
            <h2>Add User to {selectedGroup.name}</h2>
            <button className="close-button" onClick={() => setShowAddUserModal(false)}>
              &times;
            </button>
            </div>
            <ul className="user-list">
              {groupUsers.map((user) => (
                <li key={user._id}>
                  <p>{user.name}</p>
                  <button className="add-user-btn" onClick={() => addUserToGroup(user._id)}>Add</button>
                </li>
        ))}
      </ul>
    </div>
  </div>
)}
      <div className="chat-section">
          {selectedUser ? (
            <div className="chat-window">
               <div className="chat-header">
                                <img 
                                    src={selectedGroup ? (selectedGroup.image ? `${url}/images/${selectedGroup.image}` : assets.default_group_image) : (selectedUser.image ? `${url}/images/${selectedUser.image}` : assets.profile_icon2)} 
                                    alt={selectedGroup ? selectedGroup.name : selectedUser.name} 
                                    className="user-avatar" 
                                />
                                <h2 className="chat-header-name">{selectedGroup ? selectedGroup.name : selectedUser.name}</h2>
                 <div className="search-wrapper">
              {isSearchVisible && (
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="search-input"
                />
              )}
              <i
                className="fas fa-search search-iconn"
                onClick={() => setIsSearchVisible(!isSearchVisible)}
              ></i>
            </div>
              </div>
              <div className="messages">
              {Array.isArray(messages) ? (
                messages.map((msg, index) => {
                  const isFirstMessageBySender = index === 0 || messages[index - 1].sender !== msg.sender;

                  return (
                    <div
                      key={index}
                      className={`message-bubble ${msg.sender === adminId ? "sent" : "received"}`}
                    >
                      {isFirstMessageBySender && (
                        <p className="sender-name">{msg.senderName}</p>
                      )}
              <p className="textmsg">{msg.content}</p>
              <div className="message-footer">
                <span className="timestamp">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {msg.sender === adminId && (
                  <span className="read-status">
                    {msg.isRead ? (
                      <i className="fas fa-check-double" style={{ color: "blue" }}></i>
                          ) : (
                        <i className="fas fa-check" style={{ color: "gray" }}></i>
                      )}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )  : (
          <div className="message-group">
         {[...messages.receiverMessages, ...messages.senderMessages]
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)) // Sort by timestamp
          .map((msg, index) => {
            const isSameSender = index > 0 && 
              [...messages.receiverMessages, ...messages.senderMessages]
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))[index - 1].senderName === msg.senderName;

                  return (
                    <div
                      key={index}
                      className={`message-bubble ${msg.senderName ? "received-group" : "sent"}`}
                    >
                      {/* Render sender name only if it's not the same as the previous message */}
                      {!isSameSender && (
                        <p className="sender-name" style={{ color: getRandomColor() }}>{msg.senderName}</p>
                      )}
                      <p className="textmsg">{msg.content}</p>
                      <div className="message-footer">
                        <span className="timestamp-group">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                      </div>
                )}
              {typing && (
                <div className="typing-indicator">
                  <i className="fas fa-ellipsis-h"></i> {/* You can use any icon or text */}
                  <span>Typing...</span>
                </div>
              )}
              </div>
              <div className="message-input">
                <input
                  type="text"
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  onKeyPress={handleTyping}
                  placeholder="Type a message..."
                />
                <button onClick={sendMessage}>
                  <i className="fas fa-paper-plane"></i> Send
                </button>
              </div>
            </div>
          ) : (
            <div className="placeholder">
              <i className="fas fa-comments fa-3x"></i>
              <p>Select a user to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMessagingPage;


import React, { useState, useEffect } from "react"; 
import "./UserMessagingPage.css";
import axios from "axios";
import { io } from "socket.io-client";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { assets } from '../../assets/assets';

const socket = io("http://localhost:4000"); // Adjust the URL as needed

const UserMessagingPage = () => {
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [messages, setMessages] = useState([]); // Initialize as an empty array
  const [messageContent, setMessageContent] = useState("");
  const [typing, setTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [senderColors, setSenderColors] = useState({});
  const [groups, setGroups] = useState([]);
  
  const url = "http://localhost:4000";
  let userId = "";
  const token = localStorage.getItem("token");

  if (token) {
    const payload = JSON.parse(atob(token.split(".")[1])); // Decodes the payload part of the JWT
    userId = payload.id;
  }

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get(`${url}/api/chat/groups-user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (response.data.success) {
          setGroups(response.data.groups);
        }
      } catch (error) {
        console.error("Error fetching user groups:", error);
      }
    };
  
    fetchGroups();
  }, [token]);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await axios.get(`${url}/api/chat/admins`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          Accept: "application/json",
        });

        const adminsWithStatus = await Promise.all(
          response.data.admins.map(async (admin) => {
            const statusResponse = await axios.get(
              `${url}/api/chat/status/${admin._id}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );
            return {
              ...admin,
              isOnline: statusResponse.data.data.isOnline,
              lastSeen: statusResponse.data.data.lastSeen,
            };
          })
        );
        setAdmins(adminsWithStatus);
      } catch (error) {
        console.error("Error fetching admins:", error);
      }
    };
    fetchAdmins();

    socket.on("messageStatus", ({ messageId, status }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId ? { ...msg, status: status } : msg
        )
      );
    });


    if (selectedAdmin) {
      socket.emit("joinRoom", {
        senderId: userId,
        receiverId: selectedAdmin._id,
      });

      axios.patch(
        `${url}/api/chat/read`,
        { senderId: selectedAdmin._id, receiverId: userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return () => {
        socket.emit("leaveRoom", { senderId: userId });
      };
    }

    socket.on("setOnline", async (data) => {
      const { userId: onlineUserId } = data;
      if (onlineUserId === userId) {
        console.log(`User ${onlineUserId} marked online.`);
      }
    });

    socket.emit("setOnline", { userId: userId, role: "user" });

    socket.on("receiveMessage", (message) => {
      assignColorToSender(message.sender); 
      setMessages((prevMessages) => [...prevMessages, message]);
      
      if (selectedAdmin && selectedAdmin._id === message.sender) {
        axios.patch(
          `${url}/api/chat/read`,
          { senderId: message.sender, receiverId: userId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        setNotifications((prev) => [
          ...prev,
          { senderId: message.sender, content: message.content },
        ]);
      }
    });

    return () => {
      socket.emit("customDisconnect", { userId: userId, role: "user" });
      socket.off("receiveMessage");
      socket.off("typing");
      socket.off("setOnline");
      socket.emit("leaveRoom", { senderId: userId });
      socket.off("messageStatus");
    };
  }, [userId, selectedAdmin]);

  const searchMessages = async (query) => {
    try {
      const response = await axios.get(
        `${url}/api/chat/search?query=${query}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          data: { userId: userId },
        }
      );

      if (response.data.success) {
        setMessages(response.data.messages);
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
      searchMessages(e.target.value);
    }
  };

  const requestChat = async (adminId) => {
    await axios.post(
      `${url}/api/chat/request`,
      { adminId },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    alert("Chat request sent to admin.");
  };

  const startChat = async (admin) => {
    setSelectedAdmin(admin);
    const response = await axios.get(
      `${url}/api/chat/messages?receiverId=${admin._id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setMessages(response.data.messages);
  };
  
  const startGroupChat = async (group) => {
    setSelectedAdmin(group);
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
        setMessages(groupedMessages);
      } else {
        console.error("Failed to fetch group messages:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching group messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!messageContent.trim()) return;

    try {
      const response = await axios.get(`${url}/api/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const name = response.data.data.name;      
      socket.emit("sendMessage", {
        senderId: userId,  
        receiverId: selectedAdmin._id,
        content: messageContent,
        isRead: false,
      });

      if (!selectedAdmin.isOnline) {
        await axios.post(
          `${url}/api/notifications/add`, {
            sender: userId,
            senderModel: "user",
            receiver: selectedAdmin._id,
            receiverModel: "Admin",
            message: `You have a new message from ${name}`,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
      setMessageContent("");
    } catch (error) {
      console.error("Error sending message or creating notification:", error);
    }
  };

  const handleTyping = () => {
    socket.emit("typing", {
      senderId: userId,
      receiverId: selectedAdmin._id,
    });
    if (typingTimeout) clearTimeout(typingTimeout);
    setTyping(true);
    setTypingTimeout(setTimeout(() => setTyping(false), 2000));
  };

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const assignColorToSender = (senderId) => {
    setSenderColors((prevColors) => {
      if (!prevColors[senderId]) {
        const newColor = getRandomColor();
        return { ...prevColors, [senderId]: newColor };
      }
      return prevColors;
    });
  };


  return (
    <div className="user-messaging-page">
      {/* <header className="user-messaging-header">
        <h1>Welcome to the Messaging Platform</h1>
        <p>Connect with our support team for assistance</p>
      </header> */}
      <div className="user-messaging-container">
        <div className="user-admin-section">
          <h2 className="labeling">Admins</h2>
          <div className="user-admin-list">
            {admins.map((admin) => (
              <div key={admin._id} className="user-admin-profile">
                <img src={`${url}/images/`+ admin.image || assets.user2} alt={admin.name} className="user-admin-avatar" />
                <div className="user-admin-info">
                  <p className="user-admin-name">{admin.name}</p>
                  <p className={`user-admin-status ${admin.isOnline ? "user-admin-online" : "user-admin-offline"}`}>
                    {admin.isOnline ? "Online" : "Offline"}
                  </p>
                  <div className="user-admin-icon-container">
                    <i className="fas fa-comment-dots" onClick={() => startChat(admin)}></i>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="user-groups-section">
          <h2 className="labeling">Groups</h2>
          {groups.length > 0 ? (
          <div className="user-group-list">
            {groups.map((group) => (
              <div key={group._id} className="user-group-profile">
              <img src={group.image ?`${url}/images/${group.image}`:assets.NewLogo} alt={group.name} className="group-avatar" />
                <div className="user-admin-info">
                  <p className="user-group-name">{group.name}</p>
                  <div className="user-group-icon-container">
                    <i className="fas fa-comment-dots" onClick={() => startGroupChat(group)}></i>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="user-placeholder">
            <i className="fas fa-users fa-2x"></i>
            <p>No groups available. </p>
          </div>
        )}
        </div>
        </div>
        <div className="user-chat-section">
          {selectedAdmin ? (
            <div className="user-chat-window">
              <div className="user-chat-header">
                <img src={`${url}/images/` +selectedAdmin.image} alt={selectedAdmin.name} className="user-admin-avatar" />
                <h2 className="labelingg">{selectedAdmin.name}</h2>
                <div className="user-search-wrapper">
                  {isSearchVisible && (
                    <input
                      type="text"
                      placeholder="Search messages..."
                      value={searchQuery}
                      onChange={handleSearch}
                      className="user-search-input"
                    />
                  )}
                  <i
                    className="fas fa-search user-search-icon"
                    onClick={() => setIsSearchVisible(!isSearchVisible)}
                  ></i>
                </div>
              </div>
              <div className="user-messages">
                {Array.isArray(messages) ? (
                  messages.map((msg, index) => {
                    const isFirstMessageBySender = index === 0 || messages[index - 1].sender !== msg.sender;

                    return (
                      <div
                        key={index}
                        className={`user-message-bubble ${msg.sender === userId ? "user-message-sent" : "user-message-received"}`}
                      >
                        {isFirstMessageBySender && (
                          <p className="user-sender-name">{msg.senderName}</p>
                        )}
                        <p className="user-textmsg">{msg.content}</p>
                        <div className="user-message-footer">
                          <span className="user-timestamp">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {msg.sender === userId && (
                            <span className="user-read-status">
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
                ) : (
                  <div className="user-message-group">
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
                            <p className="user-textmsg">{msg.content}</p>
                            <div className="user-message-footer">
                              <span className="user-timestamp-group">
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
                  <div className="user-typing-indicator">
                    <i className="fas fa-ellipsis-h"></i>
                    <span>Typing...</span>
                  </div>
                )}
              </div>
              <div className="user-message-input">
                <input
                  type="text"
                  placeholder="Type your message..."
                  onKeyPress={handleTyping}
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                />
                <button onClick={sendMessage}>
                  <i className="fas fa-paper-plane"></i> Send
                </button>
              </div>
            </div>
          ) : (
            <div className="user-placeholder">
              <i className="fas fa-comments fa-3x"></i>
              <p>Select an admin to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserMessagingPage;
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react"; 

const Input = ({ icon: Icon,type, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const containerStyle = {
    position: "relative",
    marginBottom: "1.5rem",
  };

  const iconContainerStyle = {
    position: "absolute",
    top: "50%",
    left: "0.75rem",
    transform: "translateY(-50%)",
    display: "flex",
    alignItems: "center",
    pointerEvents: "none",
  };

  const inputStyle = {
    width: "100%",
    paddingLeft: "2.5rem",
    paddingRight: "0.75rem",
    paddingTop: "0.75rem",
    paddingBottom: "0.75rem",
    backgroundColor: "#f0f0f0",
    borderRadius: "0.5rem",
    border: `1px solid ${isFocused ? "tomato" : "#cccccc"}`,
    color: "#333333",
    transition: "all 0.2s",
    outline: "none",
    boxShadow: isFocused ? "0 0 0 2px rgba(255, 99, 71, 0.5)" : "none",
  };

  const iconStyle = {
    fontSize: "1.25rem",
    color: "tomato",
  };
  const toggleIconStyle = {
    position: "absolute",
    top: "50%",
    right: "0.75rem",
    transform: "translateY(-50%)",
    cursor: "pointer",
    color: "#888",
  };

  return (
    <div style={containerStyle}>
      <div style={iconContainerStyle}>
        <Icon style={iconStyle} />
      </div>
      <input
        {...props}
        type={type === "password" && isPasswordVisible ? "text" : type}
        style={inputStyle}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {type === "password" && (
        <div
          style={toggleIconStyle}
          onClick={() => setIsPasswordVisible(!isPasswordVisible)}
        >
          {isPasswordVisible ? <EyeOff /> : <Eye />}
        </div>
      )}
    </div>
  );
};

export default Input;

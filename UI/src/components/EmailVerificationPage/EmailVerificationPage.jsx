import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import "./EmailVerificationPage.css";
import { useNavigate } from "react-router-dom";

const EmailVerificationPage = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const Navigate = useNavigate();

  const handleChange = (index, value) => {
    const newCode = [...code];

    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedCode[i] || "";
      }
      setCode(newCode);
      const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
      const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
      inputRefs.current[focusIndex].focus();
    } else {
      newCode[index] = value;
      setCode(newCode);
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   const verificationCode = code.join("");
  //   try {
  //     console.log("Verifying email with code:", verificationCode);
  //     toast.success("Email verified successfully!");
  //     Navigate("/login");
  //   } catch (error) {
  //     console.error("Verification failed:", error);
  //     toast.error("Verification failed. Please try again.");
  //   }
  // };
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    const verificationCode = code.join(""); // Join the code array into a string

    try {
        const response = await fetch('http://localhost:4000/api/auth/verify-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: verificationCode }),
        });

        const data = await response.json();

        if (data.success) {
            toast.success("Email verified successfully!");
            Navigate("/login"); // Redirect to login
        } else {
            toast.error(data.message || "Verification failed.");
        }
    } catch (error) {
        console.error("Error verifying email:", error);
        toast.error("Verification failed. Please try again.");
    }
};

  useEffect(() => {
    if (code.every((digit) => digit !== "")) {
      handleSubmit(new Event("submit"));
    }
  }, [code]);

  return (
    <div className="log-con">
      <div
        className="background-blur"
        style={{
          backgroundImage: `url('/undraw_email_sent_re_0ofv.svg')`,
        }}
      ></div>
      <div className="container-login">
      <motion.div
  initial={{ opacity: 0, y: -50 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  className="form-card enhanced-card"
>
  <img
    src="/undraw_check-boxes_ewf2.svg"
    alt="Email Verification"
    className="form-image"
  />
  <div className="form-content">
    <h2 className="form-titlee">Verify Your Email</h2>
    <p className="form-description">
      Enter the 6-digit code sent to your email address to complete the verification process.
    </p>
    <form onSubmit={handleSubmit} className="verification-form">
      <div className="input-group-email">
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            maxLength="1"
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="verification-input enhanced-input"
          />
        ))}
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="submit"
        disabled={code.some((digit) => !digit)}
        className="btn enhanced-btnn"
      >
        Verify Email
      </motion.button>
    </form>
  </div>
</motion.div>


      </div>
    </div>
  );
};

export default EmailVerificationPage;

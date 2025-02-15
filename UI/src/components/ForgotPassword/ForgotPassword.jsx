import { motion } from "framer-motion";
import { useState } from "react";
import { useAuthStore } from "../../context/authStore";
import Input from "../../auth/Input";
import { Mail, Loader } from "lucide-react";
import "./ForgotPassword.css"; // Reuse the same Reset Password CSS for consistency
import { useNavigate } from "react-router-dom";

const ForgotPasswordPage = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { isLoading, forgotPassword } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await forgotPassword(email);
    setIsSubmitted(true);
  };

  const handleSwitchToLogin = () => {
    // Navigate back to login page
    navigate("/login");
  };

  return (
    <div className="log-con">
      <div
        className="background-blur"
        style={{
          backgroundImage: `url('/undraw_secure_login_pdn4.svg')`,
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
            src="/undraw_forgot-password_odai.svg"
            alt="Forgot Password"
            className="form-image"
          />
          <div className="form-content">
            <h2 className="form-titlee">Forgot Password</h2>
            {!isSubmitted ? (
              <>
                <p className="form-description">
                  Enter your email to receive a reset password link.
                </p>
                <form onSubmit={handleSubmit} className="reset-password-form">
                <div className="input-field">
                <i className="fas fa-envelope"></i>
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="btn enhanced-btn"
                  >
                    {isLoading ? <Loader className="loader-icon" /> : "Send Link"}
                  </motion.button>
                </form>
                <p className="form-footer">
                Remembered your password?{" "}
                <span
                  className="switch-link"
                  onClick={() => {
                    console.log("Switching to login"); // Debug
                    handleSwitchToLogin(); // This should toggle the visibility
                  }}
                >
                  Log in
                </span>
              </p>

              </>
            ) : (
              <div className="success-message">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="success-icon-container"
                >
                </motion.div>
                <p className="form-description">
                  If an account exists for {email}, you will receive a reset link shortly.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

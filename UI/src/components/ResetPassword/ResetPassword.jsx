import { useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../../context/authStore";
import { useNavigate, useParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Input from "../../auth/Input";
import { Lock } from "lucide-react";
import toast from "react-hot-toast";
import "./ResetPassword.css";
import PasswordStrengthMeter from "../../auth/PasswordStrengthMeter";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { resetPassword, error, isLoading, message } = useAuthStore();
  const { token } = useParams();
  const navigate = useNavigate();
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      await resetPassword(token, password);

      toast.success("Password reset successfully, redirecting to login page...");
      setTimeout(() => {
        navigate("/", { state: { showLoginPopup: true } });
    }, 2000);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Error resetting password");
    }
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
          {isPasswordFocused ? (
              <div className="form-image .password-strength-containerr ">
                <PasswordStrengthMeter password={password} />
              </div>
            ) : (
          <img
            src="/undraw_safe_0mei.svg"
            alt="Reset Password"
            className="form-image"
          />
            )}
          <div className="form-content">
            <h2 className="form-titlee">Reset Your Password</h2>
            <p className="form-description">
              Set a new password for your account to regain access.
            </p>
            <form className="reset-password-form" onSubmit={handleSubmit}>
              <div className="input-field">
              <i className="fas fa-lock"></i>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(password.length === 0 ? false : true)} // Keep it focused if there's content
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
                >
                 {showPassword ? <EyeOff  color="#acacac"/> : <Eye color="#acacac"/>}
                </button>
              </div>
              <div className="input-field">
              <i className="fas fa-lock"></i>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(password.length === 0 ? false : true)} // Keep it focused if there's content
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
                >
                 {showPassword ? <EyeOff  color="#acacac"/> : <Eye color="#acacac"/>}
                </button>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="reset-password-btn "
                disabled={isLoading}

              >
               {isLoading ? "Resetting..." : "Set Password"}

              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
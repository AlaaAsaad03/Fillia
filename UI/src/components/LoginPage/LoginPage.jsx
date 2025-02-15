import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader, User } from "lucide-react";
import Input from "../../auth/Input";
import PasswordStrengthMeter from "../../auth/PasswordStrengthMeter";
import { useNavigate } from "react-router-dom";
import ForgotPasswordPage from "../ForgotPassword/ForgotPassword";
import { toast } from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from "../../context/authStore"
import "./LoginPage.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const { login, signup, isLoading, isAuthenticated, isFirstLogin, checkAuth } = useAuthStore();
  const navigate = useNavigate();
  const [isPopupVisible, setIsPopupVisible] = useState(true);
  const [isForgotPasswordVisible, setIsForgotPasswordVisible] = useState(false);
  const [role, setRole] = useState("user"); // Default to user role

  // Log the current authentication status
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (storedUser && isAuthenticated) {
            if (storedUser.isFirstLogin) {
                navigate("/survey"); // Redirect to survey for first login
              } else {
                // Redirect based on admin roles
                if (["Leader", "Packager", "Delivery", "admin"].includes(storedUser.role)) {
                  navigate("/admin");
                } else {
                    navigate("/"); // Redirect to home for regular users
                }
            }
        }
    }
, [isAuthenticated, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
          await login(email, password, role); // Pass role to login function
        //   if (isAuthenticated) {
        //         setIsPopupVisible(false);
        //         // Navigate based on role after login
        //         const user = localStorage.setItem("user", JSON.stringify(data.user));
        //         console.log("User after login:", user);
        //     // Navigate based on role and isFirstLogin
        //     if (user.isFirstLogin) {
        //       console.log("Redirecting to survey...");
        //         navigate("/survey"); // Redirect to survey
        //     } else if (user.role === "Leader" || user.role === "Packager" || user.role === "Delivery") {
        //         navigate("/admin");
        //     } else {
        //       console.log("Redirecting to home...");
        //         navigate("/");
        //     }
        // }
    } catch (error) {
        toast.error(error?.message || "Login failed.");
    }
};

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await signup(email, password, name, role); // Pass role to signup function
      toast.success("Sign up successful! Please verify your email.");
      setIsPopupVisible(false);
      navigate("/verify-email");
    } catch (error) {
      toast.error(error?.message || "Error during sign up.");
    }
  };

  const handleGoogleLogin = async (response) => {
    const idToken = response.credential;

    try {
        const res = await fetch("http://localhost:4000/api/auth/google-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: idToken }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
            // Save token and user info
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            await checkAuth(); // Ensure this updates isAuthenticated
            // Redirect based on role
            const role = data.user.role;
            navigate(role === 'Leader' || role === 'Packager' || role === 'Delivery' ? "/admin" : "/");
        } else {
            toast.error(data.message || "Google login failed.");
        }
    } catch (err) {
        console.error("Google login error:", err);
        toast.error("An error occurred during Google login.");
    }
};

return (
  isPopupVisible && (
    <div className="modal-overlay">
      {!isForgotPasswordVisible ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="login-popup"
        >
          <div className="login-popup-content">
            <h2 className="login-popup-title">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h2>

            <form onSubmit={isSignUp ? handleSignUp : handleLogin}>
              {isSignUp && (
                <Input
                  icon={User}
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              )}

              <Input
                icon={Mail}
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                icon={Lock}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {isSignUp && <PasswordStrengthMeter password={password} />}

              {!isSignUp && (
              <p
                className="forgot-password-link"
                onClick={() => setIsForgotPasswordVisible(true)}
              >
                Forgot Password?
              </p>
            )}
              <motion.button
                className="login-popup-button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader className="loader-icon" size={24} />
                ) : isSignUp ? (
                  "Sign Up"
                ) : (
                  "Login"
                )}
              </motion.button>
            </form>

          {!isSignUp && ( // Only show divider and Google button for login
                  <>              
                <div className="divider">or</div> {/* Moved divider here */}
                <motion.div className="google-login-container">
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={() => console.log('Google Login Failed')}
                />
              </motion.div>
            </>
          )}
              </div>

          <div className="login-popup-footer">
            <p>
              {isSignUp ? (
                <>
                  Already have an account?{" "}
                  <span
                    className="footer-link"
                    onClick={() => setIsSignUp(false)}
                  >
                    Login
                  </span>
                </>
              ) : (
                <>
                  Don't have an account?{" "}
                  <span
                    className="footer-link"
                    onClick={() => setIsSignUp(true)}
                  >
                    Sign up
                  </span>
                </>
              )}
            </p>
          </div>
        </motion.div>
      ) : (
        <ForgotPasswordPage
          onSwitchToLogin={() => setIsForgotPasswordVisible(false)}
        />
      )}
    </div>
  )
);
};

export default LoginPage; 
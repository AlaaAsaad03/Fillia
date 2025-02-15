import { useState, useEffect } from "react"; 
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react"; 
import Input from "../../auth/Input";
import PasswordStrengthMeter from "../../auth/PasswordStrengthMeter";
import { useNavigate } from "react-router-dom";
import ForgotPasswordPage from "../ForgotPassword/ForgotPassword";
import { toast } from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from "../../context/authStore"
import "./Login.css"


const Login = () => {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const { login, signup, isLoading, isAuthenticated, isFirstLogin, checkAuth } = useAuthStore();
  const navigate = useNavigate();
  const [isPopupVisible, setIsPopupVisible] = useState(true);
  const [isForgotPasswordVisible, setIsForgotPasswordVisible] = useState(false);
  const [role, setRole] = useState("user"); // Default to user role
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const shouldShowStrengthMeter = isSignUpMode && (isPasswordFocused || password.length > 0);
  
  const handleForgotPasswordClick = () => {
    // Navigate to forgot password page
    navigate("/forgot-password");
  };
  
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
    const toggleMode = () => {
        setIsSignUpMode(!isSignUpMode);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

     // Define image sources
  const loginImage = "/undraw_check-boxes_ewf2.svg"; // Path for login image
  const signUpImage = "/undraw_empty_4zx0.svg"; // Path for signup image
  
  const handlePasswordChange = (e) => {
    console.log("Password before change:", password);
    setPassword(e.target.value);
    console.log("Password after change:", e.target.value);
};

  
  return (
    <div className="log-con">
    <div
      className="background-blur"
      style={{ 
        backgroundImage: `url(${isSignUpMode ? signUpImage : loginImage})`,
      }}
    ></div>

    <div className={`container-login ${isSignUpMode ? "sign-up-mode" : ""}`}>
      <div className="forms-container">
        <div className="signin-signup">
        {!isForgotPasswordVisible ? (
          <form className="sign-in-form" onSubmit={handleLogin}>
            <h2 className="title">Sign in</h2>
            <div className="input-field">
              <i className="fas fa-user"></i>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                />
            </div>
            <div className="input-field">
              <i className="fas fa-lock"></i>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
            <p
            className="forgot-password-link"
            onClick={() => {
              console.log("Toggling forgot password visibility"); // Debug
              handleForgotPasswordClick()  }}
              >
                Forgot Password?
              </p>

            <input type="submit" value="Login" className="btn-login solid" />
            <p className="social-text">
            <span className="line"></span>
            Or
            <span className="line"></span>
          </p>
            <div className="social-media">
            <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => console.log("Google Login Failed")}
              />
            </div>
            </form>
          ) : (
            <ForgotPasswordPage onSwitchToLogin={() =>  setIsForgotPasswordVisible(false)} />
          )}

          <form className="sign-up-form"  onSubmit={handleSignUp}>
            <h2 className="title">Sign up</h2>
            <div className="input-field">
              <i className="fas fa-user"></i>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="input-field">
              <i className="fas fa-envelope"></i>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-field">
              <i className="fas fa-lock"></i>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
                required
                onFocus={() => {
                    console.log("Password input focused");
                    setIsPasswordFocused(true);
                }}
                onBlur={() => {
                    console.log("Password input blurred");
                    setIsPasswordFocused(password.length > 0);
                }}
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
            {shouldShowStrengthMeter && (
                <div className="password-strength-container">
                  <PasswordStrengthMeter password={password} />
                </div>
              )}
            <input type="submit" className="btn-login" value="Sign up"  onClick={() => console.log("Login button clicked")} /> 
            <p className="social-text">
            <span className="line"></span>
            Or
            <span className="line"></span>
          </p>
            <div className="social-media">
            <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => console.log("Google Login Failed")}
              />
            </div>
          </form>
        </div>
      </div>

      <div className="panels-container">

        <div className="panel left-panel">
          <div className="content">
            <h3>New here ?</h3>
            <p>Be a beacon of hope! Start your journey of giving. Pack hope, spread love.</p>
            <button className="btn-login transparent" onClick={toggleMode}>
              Sign up
            </button>
          </div>
          <img src="/undraw_empty_4zx0.svg" className="image" alt="" />
        </div>
        {!shouldShowStrengthMeter && (
            <div className="panel right-panel">
              <div className="content">
                <h3>One of us?</h3>
                <p>Welcome back! Your kindness drives change. Let’s make a difference together.</p>
                <button className="btn-login transparent" onClick={toggleMode}>
                  Sign in
                </button>
              </div>
              <img src="/undraw_empty_4zx0.svg" className="image" alt="" />
            </div>
          )}
</div>
    </div>
    </div>
  );
};

export default Login;
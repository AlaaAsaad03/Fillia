import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:4000/api/auth" : "/api/auth";

axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
	user: null,
	isAuthenticated: false,
	error: null,
	isLoading: false,
	isCheckingAuth: true,
	message: null,
    role: null, // "admin" or "user"

	signup: async (email, password, name) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/register`, { email, password, name });
            // Assuming response.data.token contains the JWT token
            localStorage.setItem('token', response.data.token); // Store token in local storage

            // Store user info if needed
            localStorage.setItem('user', JSON.stringify(response.data.user)); // Save user to local storage

            set({ user: response.data.user, isAuthenticated: true, isLoading: false });
        	} catch (error) {
			set({ error: error.response.data.message || "Error signing up", isLoading: false });
			throw error;
		}
	},
    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/login`, { email, password });

            if (response.data?.success) {
                localStorage.setItem("token", response.data.token); // Store the JWT token
                localStorage.setItem("user", JSON.stringify(response.data.user)); // Store user info including role
                localStorage.setItem("role", response.data.user.role); // Store role separately
    
                set({
                    user: response.data.user,
                    isAuthenticated: true,
                    role: response.data.user.role, // Set role in Zustand state
                    isLoading: false,
                });
                toast.success("Login successful!");
            } else {
                throw new Error(response.data?.message || "Invalid credentials.");
            }
        } catch (error) {
            set({ error: error.response?.data?.message || "Login failed.", isLoading: false });
            toast.error(error.response?.data?.message || "Login failed.");
        }
    },
    verifyEmail: async (code) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/verify-email`, { code });
			set({ user: response.data.user, isAuthenticated: true, isLoading: false });
			return response.data;
		} catch (error) {
			set({ error: error.response.data.message || "Error verifying email", isLoading: false });
			throw error;
		}
	},
    checkAuth: async () => {
        set({ isCheckingAuth: true, error: null });
        try {
            const localUser = JSON.parse(localStorage.getItem("user"));
            const token = localStorage.getItem("token");
    
            if (localUser) {
                set({ user: localUser, isAuthenticated: true, role: localUser.role, isCheckingAuth: false });
                return;
            }
    
            if (token) {
                const response = await axios.get(`${API_URL}/check-auth`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                set({
                    user: response.data.user,
                    isAuthenticated: true,
                    role: response.data.user.role, // Update role
                    isCheckingAuth: false,
                });
            } else {
                set({ isAuthenticated: false, isCheckingAuth: false });
            }
        } catch (error) {
            console.error("Error checking authentication:", error); // Log the error
            set({ error: error.message || "Authentication check failed.", isCheckingAuth: false, isAuthenticated: false });
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }
    },

    logout: async () => {
        set({ isLoading: true, error: null });
        try {
            await axios.post(`${API_URL}/logout`);
            set({ user: null, isAuthenticated: false, role: null, error: null, isLoading: false });
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("role");
            toast.success("Logged out successfully!");
        } catch (error) {
            set({ error: "Error logging out", isLoading: false });
            toast.error("Error logging out");
        }
    },

    forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/forgot-password`, { email });
            set({ message: response.data.message, isLoading: false });
            toast.success("Password reset email sent.");
        } catch (error) {
            set({ error: error.response?.data?.message || "Error sending reset email.", isLoading: false });
            toast.error("Error sending reset email.");
        }
    },

    resetPassword: async (token, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/reset-password/${token}`, { password });
            set({ message: response.data.message, isLoading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || "Error resetting password.", isLoading: false });
            toast.error("Error resetting password.");
        }
    },
}));

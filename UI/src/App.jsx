import { useState,useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import { useAuthStore } from "./context/authStore";
import { GoogleOAuthProvider } from '@react-oauth/google'; // Import the provider
import { useNavigate } from 'react-router-dom';

//auth components
import LoginPage from './components/LoginPage/LoginPage'
import ResetPasswordPage from '../src/components/ResetPassword/ResetPassword'; //to be changed
import ForgotPasswordPage from '../src/components/ForgotPassword/ForgotPassword'; //to be changed
import EmailVerificationPage from '../src/components/EmailVerificationPage/EmailVerificationPage'
import GeneralLoader from './components/GeneralLoader/GeneralLoader'
import CombinedNavbar from './components/CombinedNavbar'
import Login from './components/Login/Login'

//admin components
import AdminHome from './admin/Home/Home'
import Add from  './admin/Add/Add'
import List from './admin/List/List'
import AdminCasesPage from './admin/AdminCasesPage/AdminCasesPage'
import Feedbacks from './admin/Feedbacks/Feedbacks'
import PackingCasesPage from './admin/PackingCasesPage/PackingCasesPage'
import DeliveryCasesPage from './admin/DeliveryCasesPage/DeliveryCasesPage'
import Statistics from './admin/Statistics/Statistics'
import UserSuggestions from './admin/UserSuggestions/UserSuggestions'
import AdminMessagingPage from './admin/AdminMessagingPage/AdminMessagingPage';
import AdminProfile from './admin/AdminProfile/AdminProfile '
import StaffManagement from './admin/StaffManagement/StaffManagement'
import Orders from './admin/Orders/Orders';
import AdminNavbar from './admin/Navbar/Navbar'
import AdminSidebar from './admin/Sidebar/Sidebar'
import AdminDashboard from './admin/MainLayout/MainLayout';
import User from './admin/Users/Users'
import Request from './admin/Volunteer/Requests'
import EventRequestsPage from './admin/EventRequestsPage/EventRequestsPage'
import AdminEventManagement from './admin/AdminEventManagement/AdminEventManagement';
import AnalyticsEventPage from './admin/AnalyticsEventPage/AnalyticsEventPage';

//user components
import Cart from './user/Cart/Cart'
import PlaceOrder from './user/PlaceOrder/PlaceOrder'
import Footer from './user/Footer/Footer'
import Verify from './user/Verify/Verify'
import MyOrders from './user/MyOrders/MyOrders'
import Dashboard from './user/Dashboard/Dashboard'
import Profile from './user/Profile/Profile'
import Cases from './user/Cases/Cases'
import Items from './user/Items/Items'
import MyCases from './user/MyCases/MyCases'
import CreatedCases from './user/CreatedCases/CreatedCases'
import Analysis from './user/Analysis/Analysis'
import ItemForm from './user/ItemForm/ItemForm'
import UserMessagingPage from './user/UserMessagingPage/UserMessagingPage'
import Survey from './components/Survey/Survey'
import Navbar from './user/Navbar/Navbar';
import Sidebar from './user/Sidebar/Sidebar';
import Home from './user/Home/Home';
import DonationItems from './user/DonationItems/DonationItems';
import Welcome from './user/Welcome/Welcome';
import UserQuestions from './user/UserQuestions/UserQuestions';
import EventPage from './user/EventPage/EventPage';
import DonationSuccess from './user/DonationSuccess/DonationSuccess';
import HeaderNew from './user/HeaderNew/HeaderNew';
import PaymentSuccess from './user/PaymentSuccess/PaymentSuccess';
import ItemDonationSuccess from './user/ItemDonationSuccess/ItemDonationSuccess';
import NoEventPage from './user/NoEventPage/NoEventPage';

const DashboardLayout = ({ children }) => (
  <div className="dashboard-layoutt">
        {location.pathname.startsWith('/dashboard') && <Sidebar />}

    <div className="dashboard-contentt">
      {children}
    </div>
    
  </div>
);

const AdminLayout = ({ children }) => (
  <div className="dashboard-admin">
       <AdminSidebar />
          {children}
     </div>
);

const UserLayout = ({ children }) => (
  <div className="user-layout">
    <div className="user-content">{children}</div>
  </div>
);



const App = () => {
  const { isAuthenticated, user, admin, checkAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [isBoxOpen, setIsBoxOpen] = useState(false); // State for box visibility

  const toggleBox = () => {
      setIsBoxOpen((prev) => !prev); // Toggle box visibility
  };

  const location = useLocation();
  const url = "http://localhost:4000";

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = JSON.parse(localStorage.getItem("user"));
  
        if (token && storedUser) {
          await checkAuth(); // Ensures authentication is valid
          useAuthStore.setState({
            isAuthenticated: true,
            user: storedUser,
            role: storedUser.role,
          });
        } else {
          useAuthStore.setState({ isAuthenticated: false, user: null, role: null });
        }
      } catch (error) {
        console.error("Authentication initialization error:", error);
      } finally {
        setLoading(false); // Ensure loading state is updated
      }
    };
  
    initializeAuth();
  }, [checkAuth]);
  

  

  // ProtectedRoute for user and admin
  const ProtectedRoute = ({ children, role }) => {
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check if the user is verified for the user role
    if (role === "user" && !user.isVerified) {
        return <Navigate to="/verify-email" replace />;
    }

    return children;
};

  // Redirect authenticated users to the home page
  const RedirectAuthenticatedUser = ({ children }) => {
    if (isAuthenticated && location.pathname === '/login') {
      return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;
    }
    return children;
  };
  

const renderNavbar = () => {
  // Don't show navbar on specific pages
  if (location.pathname === '/login' || location.pathname === '/verify-email' 
    || location.pathname ==='/log'   || location.pathname.startsWith('/dashboard')
    || location.pathname === '/survey'|| location.pathname.startsWith('/admin')|| location.pathname.startsWith('/myorders') 
    || location.pathname.startsWith('/forgot-password' )|| location.pathname.startsWith('/reset-password/'))
     return null;

  // Fallback for unauthenticated users
  return <Navbar isBoxOpen={isBoxOpen} toggleBox={toggleBox} />;
};


  console.log("isAuthenticated",isAuthenticated);
  console.log("user",user);

  const renderLayout = (role) => {
    if (!role) {
      return <GeneralLoader />; // Or redirect to a safe fallback route
    }
  
    if (["Leader", "Packager", "Delivery", "admin"].includes(role)) {
      return (
        <AdminLayout>
          <Routes>
            <Route path="/admin" element={<AdminHome />} />
            <Route path="/admin/add" element={<Add url={url} />} />
            <Route path="/admin/list" element={<List url={url} />} />
            <Route path="/admin/orders" element={<Orders url={url} />} />
            <Route path="/admin/cases" element={<AdminCasesPage url={url} />} />
            <Route path="/admin/feedbacks" element={<Feedbacks url={url} />} />
            <Route path="/admin/packing" element={<PackingCasesPage url={url} />} />
            <Route path="/admin/delivery" element={<DeliveryCasesPage url={url} />} />
            <Route path="/admin/statistics" element={<Statistics url={url} />} />
            <Route path="/admin/suggestions" element={<UserSuggestions url={url} />} />
            <Route path="/admin/chat" element={<AdminMessagingPage url={url} />} />
            <Route path="/admin/profile" element={<AdminProfile url={url} />} />
            <Route path="/admin/staff" element={<StaffManagement url={url} />} />
            <Route path="/admin/users" element={<User url={url} />} />
            <Route path="/admin/requests" element={<Request url={url} />} />
            <Route path="/admin/event-requests" element={<EventRequestsPage url={url} />} />
            <Route path="/admin/event-management" element={<AdminEventManagement url={url} />} />
            <Route path="/admin/analytics" element={<AnalyticsEventPage url={url} />} />
            
          </Routes>
        </AdminLayout>
      );
    }

    if (role === "user") {
      return (
        <UserLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/dashboard" element={<ProtectedRoute role="user"><DashboardLayout /></ProtectedRoute>} />
            <Route path="/cart" element={<ProtectedRoute role="user"><Cart /></ProtectedRoute>} />
            <Route path="/order" element={<PlaceOrder />} />
            <Route path="/dashboard/welcome" element={<DashboardLayout><Welcome /></DashboardLayout>} />   
            <Route path="/dashboard/profile" element={<DashboardLayout><Profile /></DashboardLayout>} />
            <Route path="/dashboard/mycases" element={<DashboardLayout><MyCases /></DashboardLayout>} />
            <Route path="/myorders" element={<ProtectedRoute role="user"><MyOrders /></ProtectedRoute>} />
            <Route path="/dashboard/createdcases" element={<DashboardLayout><CreatedCases /></DashboardLayout>} />
            <Route path="/dashboard/itemform" element={<DashboardLayout><ItemForm /></DashboardLayout>} />
            <Route path="/dashboard/my-items" element={<DashboardLayout><DonationItems /></DashboardLayout>} />
            <Route path="/dashboard/analysis" element={<DashboardLayout><Analysis /></DashboardLayout>} />
            <Route path="/dashboard/chat" element={<DashboardLayout><UserMessagingPage /></DashboardLayout>} />
            <Route path="/questions" element={<ProtectedRoute role="user"><UserQuestions /></ProtectedRoute>} />
          </Routes>
        </UserLayout>
      );
    }

    return <Navigate to="/" />;
  };

  return (
    <GoogleOAuthProvider clientId="499005000357-7rkojdbrv2ee450rga87edpb37e02fu9.apps.googleusercontent.com">
      <div className="app">
        {renderNavbar()}
      <Toaster position="top-right" reverseOrder={false} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lo" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path='/login' element={<Login />} />
          <Route path="/loader" element={<GeneralLoader />} />
          <Route path="/survey" element={<Survey />} />
          <Route path="/cases" element={<Cases />} />
          <Route path="/items" element={<Items  toggleBox={toggleBox}/>} />
          <Route path="/events" element={<EventPage />} />
          <Route path="/no-events" element={<NoEventPage />} />
          <Route path="/donation-success" element={<DonationSuccess />} />
          <Route path="/purchase-success" element={<PaymentSuccess />} />
          <Route path="/header" element={<HeaderNew />} />
          <Route path='item-success-page' element={<ItemDonationSuccess/>} />
          <Route path="/*" element={loading ? <GeneralLoader /> : (isAuthenticated && user?.role ? renderLayout(user.role) : <Navigate to="/login" />)} />
          </Routes>
        {/* {!location.pathname.startsWith('/login') && !location.pathname.startsWith('/admin')
         && !location.pathname.startsWith('/log') && !location.pathname.startsWith('/verify-email') 
         && !location.pathname.startsWith('/reset-password/') && !location.pathname.startsWith('/forgot-password')
         && !location.pathname.startsWith('/dashboard') && !location.pathname.startsWith('/myorders') && !location.pathname.startsWith('/survey')  &&<Footer />} */}
        </div>
    </GoogleOAuthProvider>
  );
};

export default App;
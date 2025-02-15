import { createContext, useState, useEffect } from "react";
import axios from "axios";

// Create a new context to hold and share data across components for admin
export const AdminStoreContext = createContext(null);

const AdminStoreContextProvider = (props) => {
  const url = "http://localhost:4000"; // backend URL
  const [token, setToken] = useState("");

  useEffect(() => {
    // Retain the admin token on page refresh
    if(localStorage.getItem("token")){
      setToken(localStorage.getItem("token"));
     }
 }, []);


  const contextValue = {
    token,
    setToken,
    url, 
  };

  return (
    <AdminStoreContext.Provider value={contextValue}>
      {props.children}
    </AdminStoreContext.Provider>
  );
};

export default AdminStoreContextProvider;
import React, { useContext, useEffect } from 'react'
import './Verify.css'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { StoreContext } from '../context/StoreContext';
import axios from 'axios';

const Verify = () => {

    const [searchParams,setSearchParams] = useSearchParams();
    const success = searchParams.get("success")
    const orderId = searchParams.get("orderId")
    const {url} = useContext(StoreContext);
    const navigate = useNavigate();

  let userId = null;
  let userRole = "";
  const token = localStorage.getItem("token");
  console.log("Token", token);

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
      userId = payload.id;
      userRole = payload.role;

      if (!userId) {
        console.error("user ID is missing from the token.");
      }
    } catch (error) {
      console.error("Invalid token format:", error);
    }
  }


    const verifyPayment = async () => {
        const response = await axios.post(url+"/api/order/verify",{success,orderId,userId}, {
            headers: { Authorization: `Bearer ${token}` },
          });
        if (response.data.success) {
            navigate("/item-success-page");
        }
        else {
            navigate("/")
        }
    }

    useEffect(()=>{
       verifyPayment(); 
    },[])


  return (
    <div className='verify'>
        <div className="spinner"></div>

    </div>
  )
}

export default Verify
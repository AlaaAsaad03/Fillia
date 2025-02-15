import React, { useState, useEffect } from 'react';
import './Home.css'
import Header from '../Header/Header'
import AboutUs from '../AboutUs/AboutUs'
import Services from '../Services/Services';
import OurTeam from '../OurTeam/OurTeam';
import MapPanel from '../MapPanel/MapPanel';
import CounterBar from '../Counter/Counter';
import UserQuestions from '../UserQuestions/UserQuestions';
import Feedback from '../Feedback/Feedback';
import HeaderNew from '../HeaderNew/HeaderNew';
import ScrollToTop from '../ScrollToTop/ScrollToTop';
import Footer from '../Footer/Footer';
import CaseSection from '../CaseSection/CaseSection';
import EventSection from '../EventSection/EventSection';

const Home = ({ searchTerm }) => {

  const [category,setCategory] = useState("All");
  // Retrieve token from localStorage
  const token = localStorage.getItem("token");

 

  useEffect(() => {
    // You can add any logic based on the token here, e.g., redirect or fetch data
    if (token) {
      console.log("Token found:", token);
      // Perform actions based on token, such as fetching user data or showing specific content
    }
  }, [token]);
return (
<div className='home'>
  <HeaderNew/>
  <CaseSection/>
  <MapPanel/> 
  <EventSection/>
  <Services/>
   <AboutUs/> 
  <OurTeam/>
  <Feedback/>
  <UserQuestions/>
  <ScrollToTop/>
  <Footer/>
</div>

)
}

export default Home
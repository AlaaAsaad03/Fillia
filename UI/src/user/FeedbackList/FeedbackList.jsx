// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { EffectCoverflow, Pagination, Navigation } from "swiper/modules";
// import { assets } from "../../assets/assets";
// import "swiper/css";
// import "swiper/css/effect-coverflow";
// import "swiper/css/pagination";
// import "swiper/css/navigation";

// import "./FeedbackList.css";

// const FeedbackList = () => {
//   const [feedbacks, setFeedbacks] = useState([]);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchFeedbacks = async () => {
//       try {
//         const res = await axios.get("http://localhost:4000/api/feedback/all");
//         console.log("Fetched Feedbacks:", res.data.feedbacks);
//         setFeedbacks(res.data.feedbacks);
//       } catch (err) {
//         console.error("Error fetching feedbacks:", err);
//         setError("Failed to fetch feedbacks. Please try again later.");
//       }
//     };
//     fetchFeedbacks();
//   }, []);

//   const renderFeedbacks = () => {
//     if (error) {
//       return <div className="feedback-carousel-error">{error}</div>;
//     }

//     if (feedbacks.length === 0) {
//       return (
//         <div className="loading-feedbacks">
//           <p>Loading Feedbacks...</p>
//         </div>
//       );
//     }

//     return (
//       <Swiper
//         effect="coverflow"
//         grabCursor={true}
//         centeredSlides={true}
//         loop={true}
//         slidesPerView={2.5} // Adjust to show more cards side by side
//         spaceBetween={20} // Space between cards
//         breakpoints={{
//           640: { slidesPerView: 1 },
//           768: { slidesPerView: 2 },
//           1024: { slidesPerView: 3 },
//         }}
//         coverflowEffect={{
//           rotate: 0,
//           stretch: 0,
//           depth: 100,
//           modifier: 2.5,
//         }}
//         pagination={{ clickable: true }}
//         navigation
//         modules={[EffectCoverflow, Pagination, Navigation]}
//         className="swiper_container"
//       >
//         {feedbacks.map((feedback, index) => (
//         <SwiperSlide key={index}>
//         <div className="slide">
//           <div className="user-info">
//             <img
//               src={feedback.userId?.image ? `http://localhost:4000/images/${feedback.userId.image}` : assets.user1}
//               alt={feedback.userId?.name || "User"}
//               className="user-image"
//             />
//             <h3>{feedback.userId?.name || "Anonymous"}</h3>
//             <div className="name-line"></div>
//             <div className="feedback-container">
//               <p>{feedback.feedback}</p>
//             </div>
//           </div>
//         </div>
//       </SwiperSlide>
      
//         ))}
//       </Swiper>
//     );
//   };

//   return (
//     <div className="testimonials">
//       <div className="title">
//         <p>Testimonials</p>
//         <h2>What People Say</h2>
//       </div>
//       {renderFeedbacks()}
//     </div>
//   );
// };

// export default FeedbackList;

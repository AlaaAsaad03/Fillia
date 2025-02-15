// import { useState } from "react";
// import axios from "axios";
// import "./UserFeedback.css";

// const UserFeedback = () => {
//   const [feedback, setFeedback] = useState("");
//   const [message, setMessage] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const token = localStorage.getItem("token");
//       const res = await axios.post(
//         "http://localhost:4000/api/feedback/add",
//         { feedback },
//         { headers: { token } }
//       );
//       setMessage("Thank you for your feedback!");
//       setFeedback("");
//     } catch (error) {
//       setMessage("Something went wrong. Please try again.");
//     }
//   };

//   return (
//     <div className="feedback-container">
//       <h3 className="feedback-header">Feedback</h3>
//       <form onSubmit={handleSubmit} className="feedback-form">
//         <textarea
//           className="feedback-textarea"
//           value={feedback}
//           onChange={(e) => setFeedback(e.target.value)}
//           placeholder="We value your feedback!"
//           required
//         />
//         <button type="submit" className="feedback-button">
//           Submit
//         </button>
//       </form>
//       {message && <p className="feedback-message">{message}</p>}
//     </div>
//   );
// };

// export default UserFeedback;
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import "./Feedback.css";

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [active, setActive] = useState(0);
  const [newFeedback, setNewFeedback] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:4000/api/feedback/all")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFeedbacks(data.feedbacks);
        }
      })
      .catch((error) => console.error("Error fetching feedbacks:", error));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const feedbackHeight = window.innerHeight; // Adjust based on feedback card height
      const newActive = Math.floor(scrollY / feedbackHeight) % feedbacks.length;
      setActive(newActive);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [feedbacks.length]);

  const handleNext = () => {
    setActive((prev) => (prev + 1) % feedbacks.length);
  };

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + feedbacks.length) % feedbacks.length);
  };

  const handleFeedbackSubmit = async () => {
    const userId = "someUserId"; // Replace this with actual user ID logic
    const response = await fetch("http://localhost:4000/api/feedback/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ feedback: newFeedback, userId }),
    });
    const data = await response.json();
    if (data.success) {
      setNewFeedback(""); // Clear input on success
    } else {
      console.error("Error adding feedback:", data.message);
    }
  };

  const randomRotateY = () => Math.floor(Math.random() * 21) - 10;

  if (feedbacks.length === 0) {
    return <p className="text-center text-gray-500">No feedbacks available.</p>;
  }

  return (
    <div className="feedback-section">
      <div className="title">
        <p className="n">- Testimonials -</p>
      </div>
      <div className="FeedBacks-Layout">
        <div className="cards-feed">
          <h2>Feedbacks !</h2>
          <div className="feedback-container">
            <div className="feedback-card-wrapper">
              <AnimatePresence>
                {feedbacks.map((feedback, index) => (
                  <motion.div
                    key={feedback._id}
                    className={`feedback-card ${index === active ? "active" : ""}`}
                    initial={{ opacity: 0, scale: 0.8, rotate: randomRotateY() }}
                    animate={{ opacity: index === active ? 1 : 0.7, scale: index === active ? 1 : 0.9, rotate: index === active ? 0 : randomRotateY() }}
                    exit={{ opacity: 0, scale: 0.8, rotate: randomRotateY() }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
                    <div className="feedback-header">
                      <img
                        src={`http://localhost:4000/uploads/${feedback.userId.image}`}
                        alt={feedback.userId.name}
                        className="profile-image"
                      />
                      <div className="user-info">
                        <h3 className="feedback-name">{feedback.userId.name}</h3>
                        <p className="feedback-designation">{feedback.userId.designation}</p>
                      </div>
                    </div>
                    <div className="cardbody">
                      <motion.p className="feedback-text">
                        <span className="quote-mark">“</span>
                        {feedback.feedback.split(" ").map((word, index) => (
                          <motion.span
                            key={index}
                            initial={{ filter: "blur(10px)", opacity: 0, y: 5 }}
                            animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: 0.02 * index }}
                            className="inline-block"
                          >
                            {word}&nbsp;
                          </motion.span>
                        ))}
                        <span className="quote-mark">”</span>
                      </motion.p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="feedback-controls">
              <button onClick={handlePrev} className="control-button"><IconArrowLeft /></button>
              <button onClick={handleNext} className="control-button"><IconArrowRight /></button>
            </div>
          </div>
        </div>
        <img src="/feed.png" alt="" className="cloud" />
        <div className="feedback-form">
          <h2>Share Your Experience ?</h2>
          <textarea value={newFeedback} onChange={(e) => setNewFeedback(e.target.value)} placeholder="Write your feedback here..." />
          <button onClick={handleFeedbackSubmit} className="submit-buttonn">Submit</button>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
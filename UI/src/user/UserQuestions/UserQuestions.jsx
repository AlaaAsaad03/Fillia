import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./UserQuestions.css";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const UserQuestions = () => {
  const [expanded, setExpanded] = useState(null);
  const [question, setQuestion] = useState("");
  const [email, setEmail] = useState("");
  const [alertMessage, setAlertMessage] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const listRef = useRef(null);

  const questions = [
    { id: 1, text: "How can I update my profile?", answer: "Go to settings and click 'Edit Profile'." },
    { id: 2, text: "Where can I see my transactions?", answer: "You can find them under 'Transaction History'." },
    { id: 3, text: "How do I reset my password?", answer: "Click 'Forgot Password' on the login page." },
    { id: 4, text: "What payment methods do you accept?", answer: "We accept credit/debit cards and PayPal." },
    { id: 5, text: "How do I contact support?", answer: "You can email us at filliaspprt@gmail.com." },
    { id: 6, text: "Is my data secure?", answer: "Yes, we use industry-standard encryption." },
    { id: 7, text: "Do you offer refunds?", answer: "Yes, refunds are available within 30 days of purchase." },
    { id: 8, text: "How can I update my profile?", answer: "Go to settings and click 'Edit Profile'." },
    { id: 9, text: "Where can I see my transactions?", answer: "You can find them under 'Transaction History'." },
    { id: 10, text: "How do I reset my password?", answer: "Click 'Forgot Password' on the login page." },
    { id: 11, text: "What payment methods do you accept?", answer: "We accept credit/debit cards and PayPal." },
    { id: 12, text: "How do I contact support?", answer: "You can email us at filliaspprt@gmail.com." },
    { id: 13, text: "Is my data secure?", answer: "Yes, we use industry-standard encryption." },
    { id: 14, text: "Do you offer refunds?", answer: "Yes, refunds are available within 30 days of purchase." },
    { id: 15, text: "How can I update my profile?", answer: "Go to settings and click 'Edit Profile'." },
    { id: 16, text: "Where can I see my transactions?", answer: "You can find them under 'Transaction History'." },
    { id: 17, text: "How do I reset my password?", answer: "Click 'Forgot Password' on the login page." },
    { id: 18, text: "What payment methods do you accept?", answer: "We accept credit/debit cards and PayPal." },
    { id: 19, text: "How do I contact support?", answer: "You can email us at filliaspprt@gmail.com." },
    { id: 20, text: "Is my data secure?", answer: "Yes, we use industry-standard encryption." },
    { id: 21, text: "Do you offer refunds?", answer: "Yes, refunds are available within 30 days of purchase." },
    { id: 22, text: "How can I update my profile?", answer: "Go to settings and click 'Edit Profile'." },
    { id: 23, text: "Where can I see my transactions?", answer: "You can find them under 'Transaction History'." },
    { id: 24, text: "How do I reset my password?", answer: "Click 'Forgot Password' on the login page." },
    { id: 25, text: "What payment methods do you accept?", answer: "We accept credit/debit cards and PayPal." },
    { id: 26, text: "How do I contact support?", answer: "You can email us at filliaspprt@gmail.com." },
    { id: 27, text: "Is my data secure?", answer: "Yes, we use industry-standard encryption." },
    { id: 28, text: "Do you offer refunds?", answer: "Yes, refunds are available within 30 days of purchase." },
    { id: 29, text: "How can I update my profile?", answer: "Go to settings and click 'Edit Profile'." },
    { id: 30, text: "Where can I see my transactions?", answer: "You can find them under 'Transaction History'." },
    { id: 31, text: "How do I reset my password?", answer: "Click 'Forgot Password' on the login page." },
    { id: 32, text: "What payment methods do you accept?", answer: "We accept credit/debit cards and PayPal." },
    { id: 33, text: "How do I contact support?", answer: "You can email us at filliaspprt@gmail.com." },
    { id: 34, text: "Is my data secure?", answer: "Yes, we use industry-standard encryption." },
    { id: 35, text: "Do you offer refunds?", answer: "Yes, refunds are available within 30 days of purchase." },
    { id: 36, text: "How can I update my profile?", answer: "Go to settings and click 'Edit Profile'." },
    { id: 37, text: "Where can I see my transactions?", answer: "You can find them under 'Transaction History'." },
    { id: 38, text: "How do I reset my password?", answer: "Click 'Forgot Password' on the login page." },
    { id: 39, text: "What payment methods do you accept?", answer: "We accept credit/debit cards and PayPal." },
    { id: 40, text: "How do I contact support?", answer: "You can email us at filliaspprt@gmail.com." },
    { id: 41, text: "Is my data secure?", answer: "Yes, we use industry-standard encryption." },
    { id: 42, text: "Do you offer refunds?", answer: "Yes, refunds are available within 30 days of purchase." },

  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (question.trim() === "") return;

    try {
        await axios.post("http://localhost:4000/api/request/send-email", { email: email, message: question }, {
            headers: { "Content-Type": "application/json" },
          });
      setAlertMessage({ text: "Your question was sent successfully!", type: "success" });
      setQuestion("");
      setEmail("");
    } catch (error) {
      setAlertMessage({ text: "Failed to send your question. Please try again.", type: "error" });
      console.error("Error submitting question:", error);
    }
    setTimeout(() => setAlertMessage(null), 1000);

  };

  // Smooth scrolling effect
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      if (listRef.current) {
        listRef.current.scrollBy({ top: 50, behavior: "smooth" });

        // Reset scroll when reaching the bottom
        if (listRef.current.scrollTop + listRef.current.clientHeight >= listRef.current.scrollHeight) {
          listRef.current.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div className="question-Parts">
       <div className="title">
        <p className="n">- Questions -</p>
      </div>
      <div className="Question-Layout">
      <h2 className="faq-title">Frequently Asked Questions</h2>

    <div className="user-questions-container">
        {alertMessage && (
        <div className={`alert ${alertMessage.type}`}>
          {alertMessage.text}
        </div>
      )}
      <div 
        className="questions-section"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="faq-list" ref={listRef}>
          {questions.map((q) => (
            <div key={q.id} className="faq-item">
              <div className="faq-question" onClick={() => setExpanded(expanded === q.id ? null : q.id)}>
                {q.text}
                {expanded === q.id ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              {expanded === q.id && <div className="faq-answer">{q.answer}</div>}
            </div>
          ))}
        </div>
      </div>

      <div className="ask-question-form">
        <h2 className="form-title">Do you have any specific question?</h2>
        <p className="form-subtext">Please fill the form below and our support team will get in touch with you as soon as possible.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input"
          />
          <textarea
            placeholder="Enter your question here"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            className="form-textarea"
          ></textarea>
          <button type="submit" className="form-submit-btn">Submit Question</button>
        </form>
      </div>
    </div>
    </div>
</div>
  );
};

export default UserQuestions;



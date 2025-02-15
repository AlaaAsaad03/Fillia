import React, { useEffect, useState } from "react";
import axios from "axios";
import "./EventPage.css";
import AnimatedText from "../ExploreMenu/AnimatedText";
import ReactSlider from "react-slider";
import { motion } from "framer-motion";
import { FaShoppingCart } from "react-icons/fa";
import { FiInfo } from "react-icons/fi";
import { FaMapMarkerAlt, FaPhone } from "react-icons/fa";
import Footer from "../Footer/Footer";
import GeneralLoader from "../../components/GeneralLoader/GeneralLoader";


function EventPage() {
      const [event, setEvent] = useState(null);
      const [loading, setLoading] = useState(false);
      const [timeRemaining, setTimeRemaining] = useState(null);
      const [cases, setCases] = useState([]); // Store donation cases
      const [donationAmounts, setDonationAmounts] = useState({}); // Track slider values
      const url = "http://localhost:4000";
      const [selectedItem, setSelectedItem] = useState(null);
      const [showPopup, setShowPopup] = useState(false);
      const [items, setItems] = useState([]);
      const [showBuyPopup, setShowBuyPopup] = useState(false);
      const [buyerInfo, setBuyerInfo] = useState({ phone: "", location: "", quantity: 1 });
      const [itemImage, setItemImage] = useState(null); // State for the selected image file
      
        // State for Add Case Form (for donation)
      const [caseTitle, setCaseTitle] = useState("");
      const [caseDescription, setCaseDescription] = useState("");
      const [amountRequired, setAmountRequired] = useState(0);

      // State for Add Item Form (for items)
      const [itemName, setItemName] = useState("");
      const [itemDescription, setItemDescription] = useState("");
      const [itemQuantity, setItemQuantity] = useState(1);
      const [itemPrice, setItemPrice] = useState(0);

      // Popup visibility control
      const [showAddCasePopup, setShowAddCasePopup] = useState(false);
      const [showAddItemPopup, setShowAddItemPopup] = useState(false);
      const token = localStorage.getItem("token");
      let userId = null;
      
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          userId = payload.id;
        } catch (error) {
          console.error("Invalid token format:", error);
        }
      } else {
        console.warn("User is not logged in.");
      }

  // Logic to check if goal is reached
  const isGoalReached = (caseData) => {
    return caseData.amountCollected >= caseData.amountRequired;
  };

  useEffect(() => {

    const fetchEvent = async () => {
      setLoading(true); // Start loading
      try {
        const res = await axios.get("http://localhost:4000/api/event/event-schedule", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.redirect) {
          // Redirect to the no-events page
          window.location.href = res.data.redirect;
          return; // Stop execution
        }
        
        const eventData = res.data[0];
        setEvent(eventData);
  
        if (eventData.status === "Scheduled") {
          const startDate = new Date(eventData.startDate).getTime();
          const interval = setInterval(() => {
            const now = new Date().getTime();
            const remaining = startDate - now;
  
            if (remaining <= 0) {
              clearInterval(interval);
              setTimeRemaining(null);
            } else {
              setTimeRemaining({
                days: Math.floor(remaining / (1000 * 60 * 60 * 24)),
                hours: Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((remaining % (1000 * 60)) / 1000),
              });
            }
          }, 1000);
          return () => clearInterval(interval);;
        } else if (eventData.status === "Ongoing" && eventData.type === "Donation") {
          fetchCases(eventData._id);
  
          // Timer for ongoing event end date
          const endDate = new Date(eventData.endDate).getTime();
          const ongoingInterval = setInterval(() => {
            const now = new Date().getTime();
            const remaining = endDate - now;
  
            if (remaining <= 0) {
              clearInterval(ongoingInterval);
              setTimeRemaining(null);
            } else {
              setTimeRemaining({
                days: Math.floor(remaining / (1000 * 60 * 60 * 24)),
                hours: Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((remaining % (1000 * 60)) / 1000),
              });
            }
          }, 1000);
  
          return () => clearInterval(ongoingInterval);
        } else{
          if (eventData.status === "Ongoing" && eventData.type === "Items") {
            fetchItems(eventData._id);

              // Timer for ongoing event end date
          const endDate = new Date(eventData.endDate).getTime();
          const ongoingInterval = setInterval(() => {
            const now = new Date().getTime();
            const remaining = endDate - now;
  
            if (remaining <= 0) {
              clearInterval(ongoingInterval);
              setTimeRemaining(null);
            } else {
              setTimeRemaining({
                days: Math.floor(remaining / (1000 * 60 * 60 * 24)),
                hours: Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((remaining % (1000 * 60)) / 1000),
              });
            }
          }, 1000);
          }
        }
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
      setLoading(false); // Stop loading
    }

    };
  
    fetchEvent();
  }, []);
  
  const openPopup = (item) => {
    setSelectedItem(item);
    setShowPopup(true);
  };
  const fetchItems = async (eventId) => {
    try {
      const res = await axios.get(`http://localhost:4000/api/event/get-items?eventId=${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data.items);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };
  

  const fetchCases = async (eventId) => {
    try {
      const res = await axios.get(`http://localhost:4000/api/event/get-cases?eventId=${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCases(res.data.cases);
    } catch (error) {
      console.error("Error fetching cases:", error);
    }
  };

  const handleDonationChange = (caseId, amount) => {
    setDonationAmounts((prev) => ({
      ...prev,
      [caseId]: amount,
    }));
  };

  const handleDonate = async (caseId) => {
    const selectedAmount = Number(donationAmounts[caseId]) || 0;  // Get the selected amount from the slider
    const amountCollected = cases.find(c => c._id === caseId).amountCollected; // Get the amount already collected
    const donationAmount = selectedAmount - amountCollected;  // Calculate the donation amount as the difference
  
    if (donationAmount <= 0) {
      alert("Please select a valid donation amount greater than the amount already collected.");
      return;
    }
  
    if (window.confirm(`You will donate $${donationAmount}. Proceed?`)) {
      try {
        const res = await axios.post(
          "http://localhost:4000/api/event/donate",
          { userId, caseId, amount: donationAmount, eventId: event._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        window.location.href = res.data.url;
      } catch (error) {
        console.error("Donation error:", error);
        alert("Error processing donation.");
      }
    }
  };


  const handleBuy = async () => {
    try {
      const res = await axios.post("http://localhost:4000/api/event/buy-item", {
        userId,
        itemId: selectedItem._id,
        buyerPhone: buyerInfo.phone,
        buyerLocation: buyerInfo.location,
        quantity: buyerInfo.quantity,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      window.location.href = res.data.url; // Redirect to Stripe
    } catch (error) {
      console.error("Error processing purchase:", error);
      alert("Error processing purchase. Please try again.");
    }
  };
  

  const openBuyPopup = (item) => {
    setSelectedItem(item);
    setBuyerInfo({ phone: "", location: "", quantity: 1 });
    setShowBuyPopup(true);
  };



// Handling Add Case
const handleAddCase = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post(
      "http://localhost:4000/api/event/case",
      { title: caseTitle, description: caseDescription, amountRequired,  eventId: event._id },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert("Case added successfully!");
    setShowAddCasePopup(false);
    // Reset form fields
    setCaseTitle("");
    setCaseDescription("");
    setAmountRequired(0);
  } catch (error) {
    console.error("Error adding case:", error);
    alert("Error adding case. Please try again.");
  }
};

// Handling Add Item
const handleAddItem = async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append('userId', userId);
  formData.append('eventId', event._id);
  formData.append('name', itemName);
  formData.append('description', itemDescription);
  formData.append('quantity', itemQuantity);
  formData.append('price', itemPrice);
  formData.append('image', itemImage); // Append the image file
  formData.append('createrPhone', buyerInfo.phone); // Add this line
  formData.append('createrLocation', buyerInfo.location); // And this line
  try {
      const res = await axios.post("http://localhost:4000/api/event/item", formData, {
          headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data' // Set the content type to multipart
          }
      });
      alert("Item added successfully!");
      setShowAddItemPopup(false);
       // Reset form fields
    setItemName("");
    setItemDescription("");
    setItemQuantity(1);
    setItemPrice(0);
    setItemImage(null);
    setBuyerInfo({ phone: "", location: "", quantity: 1 });
  } catch (error) {
      console.error("Error adding item:", error);
      alert("Error adding item. Please try again.");
  }
};
  if (!event) return <p>Loading event data...</p>;
  if (loading) {
    return <GeneralLoader message="Loading event data..." />;
  }

  

  return (
    <div className="whole-page">
    <div className="event-page">
      <div className="event-container">
        <div className="title">
        <motion.h1
            className="event-title"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            whileHover={{ scale: 1.1, textShadow: "0px 0px 10px rgba(255,99,71,0.8)" }}
          >
         {event.title} 
        </motion.h1>
          <AnimatedText text={event.description} className="t22" />
        </div>
        <hr className="hrr"/>

        {event.status === "Ongoing" && event.type === "Donation" && (
          <>
          {event.status === "Ongoing" && timeRemaining && (
          <div className="countdown-container">
            <h3 className="countdown-title">Time Remaining</h3>
            <div className="countdown-timer">
              <div className="timer-card">
                <p className="time">{timeRemaining.days}</p>
                <span className="label">Days</span>
              </div>
              <div className="timer-card">
                <p className="time">{timeRemaining.hours}</p>
                <span className="label">Hours</span>
              </div>
              <div className="timer-card">
                <p className="time">{timeRemaining.minutes}</p>
                <span className="label">Minutes</span>
              </div>
              <div className="timer-card">
                <p className="time">{timeRemaining.seconds}</p>
                <span className="label">Seconds</span>
              </div>
            </div>
          </div>
        )}

            <div className="cases-containeer">
              {cases.length > 0 ? (
                cases.map((c) => {
                  const goalReached = isGoalReached(c);
                  return (
                    <div key={c._id} className="case-cardd">
                      <div className="case-image">
                        <img src="/photo1.png" alt={c.title} className=""/>
                        <span className="category-badge">{c.category}</span>
                      </div>
                      <div className="case-content">
                        <h3>{c.title}</h3>
                        <p>{c.description}</p>
                        {/* <div className="progress-container">
                          <div className="progress-barr">
                            <div className="progress-filll" style={{ width: `${percentage}%` }}></div>
                          </div>
                          <span className="progress-text">{percentage}%</span>
                        </div> */}

                        <div className="pcont">
                        <div className="funds-info">
                          <span className="raised">
                            ${c.amountCollected.toLocaleString()} <small>Raised</small>
                          </span>
                          <span className="goal">
                            ${c.amountRequired.toLocaleString()} <small>Goal</small>
                          </span>
                        </div>

                        {/* Donation slider */}
                        <div className="slider-container">
                        <ReactSlider
                        value={donationAmounts[c._id] || c.amountCollected}  // Start at amountCollected
                        min={c.amountCollected}  // Minimum value is the amount collected
                        max={c.amountRequired}  // Maximum value is the full amount required
                        step={1}  // Step size of 1
                        onChange={(value) => handleDonationChange(c._id, value)}  // Update the selected value
                        renderThumb={(props) => <div {...props} className="slider-thumb" />}  // Custom slider thumb
                        className="donation-slider"  // Custom slider styling
                      />
                      <div className="slider-info">
                        <span>${donationAmounts[c._id] || c.amountCollected}</span>  {/* Show selected amount */}
                        <span>of ${c.amountRequired.toLocaleString()}</span>  {/* Show total required amount */}
                      </div>
                                            
                      </div>

                      </div>
<button
                          onClick={() => handleDonate(c._id)}
                          className="donate-btn"
                          disabled={goalReached} // Disable the button when the goal is reached
                        >
                          Donate
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>No cases available.</p>
              )}
            </div>
          </>
        )} 
        
         {event.status === "Ongoing" && event.type === "Items" && (
          <>
           {event.status === "Ongoing" && timeRemaining && (
          <div className="countdown-container">
            <h3 className="countdown-title">Time Remaining</h3>
            <div className="countdown-timer">
              <div className="timer-card">
                <p className="time">{timeRemaining.days}</p>
                <span className="label">Days</span>
              </div>
              <div className="timer-card">
                <p className="time">{timeRemaining.hours}</p>
                <span className="label">Hours</span>
              </div>
              <div className="timer-card">
                <p className="time">{timeRemaining.minutes}</p>
                <span className="label">Minutes</span>
              </div>
              <div className="timer-card">
                <p className="time">{timeRemaining.seconds}</p>
                <span className="label">Seconds</span>
              </div>
            </div>
          </div>
        )}
          <div className="items-containerr">
          {items.length > 0 ? (
            items.map((item) => (
              <motion.div
                key={item._id}
                className={`item-cardd ${item.quantity === 0 ? "sold-out" : ""}`} // Apply greyed-out style if sold out
                whileHover={{ scale: item.quantity > 0 ? 1.05 : 1 }} // Prevent hover effect if sold out
              >
                <img src={`${url}/images/` + item.image} alt={item.title} className="item-imagee" />
                <div className="item-contentt">
                  <h3>{item.name}</h3>
                  <p>By {item.createrId.name}</p>
                  <div className="item-actionss">
                    {item.quantity > 0 ? (
                      <button className="btn buy-now-btn" onClick={() => openBuyPopup(item)}>
                        <FaShoppingCart /> Buy Now
                      </button>
                    ) : (
                      <button className="btn sold-out-btn" disabled>
                        Sold Out
                      </button>
                    )}
                    <button className="info-btn" onClick={() => openPopup(item)}>
                      <FiInfo className="icon" /> 
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <p>No items available.</p>
          )}

          </div>
          </>
        )}
     

      {showPopup && selectedItem && (
   <div className="popup-overlay">

        <div className="popup">
          <div className="popup-content">
            <div className="closee" onClick={() => setShowPopup(false)}>
          &times;
        </div>
            <img src={`${url}/images/` + selectedItem.image} alt={selectedItem.title} className="popup-image" />
            <h2>{selectedItem.name}</h2>
            <p>{selectedItem.description}</p>
            <p className="quantity"><strong>Quantity: </strong> {selectedItem.quantity}</p>
            <div className="user-info-event">
            <img src={`${url}/images/` + selectedItem.createrId.image} alt="User" className="user-image-event" />
            <div className="user-details-event">
              <p><strong>Posted by:  </strong>  {selectedItem.createrId.name}</p>
              <div className="location-phone">
                <p><FaMapMarkerAlt /> {selectedItem.createrLocation}</p>
                <p><FaPhone /> {selectedItem.createrPhone}</p>
              </div>
            </div>
          </div>



          </div>
        </div>
        </div>
      )}

      {showBuyPopup && selectedItem && (
        <div className="popup-overlay">
        <div className="popup">
          <div className="popup-content">
            <span className="closee" onClick={() => setShowBuyPopup(false)}>&times;</span>
            <h2>Buy {selectedItem.name}</h2>
            
            <label>Phone Number:</label>
            <input 
              type="text" 
              value={buyerInfo.phone} 
              onChange={(e) => setBuyerInfo({ ...buyerInfo, phone: e.target.value })} 
            />

            <label>Location:</label>
            <input 
              type="text" 
              value={buyerInfo.location} 
              onChange={(e) => setBuyerInfo({ ...buyerInfo, location: e.target.value })} 
            />

            <label>Quantity:</label>
            <input 
              type="number" 
              min="1" 
              max={selectedItem.quantity} 
              value={buyerInfo.quantity} 
              onChange={(e) => setBuyerInfo({ ...buyerInfo, quantity: Math.min(selectedItem.quantity, Number(e.target.value)) })} 
            />

            <button className="confirm-btn" onClick={handleBuy}>Proceed to Checkout</button>
          </div>
        </div>
        </div>
      )}
      {event.status === "Scheduled" && (event.type === "Donation" || event.type === "Items") && timeRemaining && (

      <motion.div
          className="large-countdown-container"
          animate={{
            scale: [1, 1.05, 1], // Pulsing effect
            textShadow: [
              "0 0 10px rgba(255, 99, 71, 0.8)", 
              "0 0 20px rgba(255, 99, 71, 0.5)", 
              "0 0 10px rgba(255, 99, 71, 0.8)"
            ],
          }}
          transition={{
            duration: 1, // Duration of one complete pulse
            ease: "easeInOut",
            repeat: Infinity, // Repeat the pulse indefinitely
          }}
        >

          <h3 className="large-countdown-title">Time Remaining</h3>
          <div className="large-countdown-timer">
            <div className="large-timer-card">
              <p className="large-time">{timeRemaining.days}</p>
              <span className="large-label">Days</span>
            </div>
            <div className="large-timer-card">
              <p className="large-time">{timeRemaining.hours}</p>
              <span className="large-label">Hours</span>
            </div>
            <div className="large-timer-card">
              <p className="large-time">{timeRemaining.minutes}</p>
              <span className="large-label">Minutes</span>
            </div>
            <div className="large-timer-card">
              <p className="large-time">{timeRemaining.seconds}</p>
              <span className="large-label">Seconds</span>
            </div>
          </div>
        </motion.div>
      )}
     


          {event.status === "Scheduled" && event.type === "Donation" && (
          <button onClick={() => setShowAddCasePopup(true)} className="add-ccase-btn">Add Donation Case</button>

          )}

          {event.status === "Scheduled" && event.type === "Items" && (
          <button onClick={() => setShowAddItemPopup(true)} className="add-ccase-btn">Add Item</button>
          
          )}
          {/* Add Case Popup */}
          {showAddCasePopup && (
            <div className="popup-overlay">
                  <div className="popup-overlay">
                    <div className="popup-content">
                      <span className="closee" onClick={() => setShowAddCasePopup(false)}>&times;</span>
                      <h2>Add Donation Case</h2>
                      <form onSubmit={handleAddCase}>
                        <label>Case Title:</label>
                        <input 
                          type="text" 
                          value={caseTitle} 
                          onChange={(e) => setCaseTitle(e.target.value)} 
                          required 
                        />

                        <label>Description:</label>
                        <textarea 
                          value={caseDescription} 
                          onChange={(e) => setCaseDescription(e.target.value)} 
                          required 
                        />

                        <label>Amount Required:</label>
                        <input 
                          type="number" 
                          value={amountRequired} 
                          onChange={(e) => setAmountRequired(e.target.value)} 
                          required 
                        />

                        <button type="submit" className="add-case-btn">Add Case</button>
                      </form>
                    </div>
                  </div>
                </div>
                )}



          {/* Add Item Popup */}
          {showAddItemPopup && (
        <div className="add-item-popup-overlay">
          <div className="add-item-popup-content">
            <span className="add-item-close-popup" onClick={() => setShowAddItemPopup(false)}>&times;</span>
            <h2 className="add-item-title">Add New Item</h2>
            <form onSubmit={handleAddItem} className="add-item-form">
              <div className="add-item-input-group">
                <div className="add-item-input-pair">
                  <div className="add-item-input-wrapper">
                    <label className="add-item-label">Item Name:</label>
                    <input
                      type="text"
                      className="add-item-input-name"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="add-item-input-wrapper">
                    <label className="add-item-label">Quantity:</label>
                    <input
                      type="number"
                      className="add-item-input-quantity"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="add-item-input-pair">
                  <div className="add-item-input-wrapper">
                    <label className="add-item-label">Price:</label>
                    <input
                      type="number"
                      className="add-item-input-price"
                      value={itemPrice}
                      onChange={(e) => setItemPrice(e.target.value)}
                      required
                    />
                  </div>
                  <div className="add-item-input-wrapper">
                    <label className="add-item-label">Phone:</label>
                    <input
                      type="text"
                      className="add-item-input-phone"
                      value={buyerInfo.phone}
                      onChange={(e) => setBuyerInfo({ ...buyerInfo, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="add-item-input-pair">
                  <div className="add-item-input-wrapper">
                    <label className="add-item-label">Location:</label>
                    <input
                      type="text"
                      className="add-item-input-location"
                      value={buyerInfo.location}
                      onChange={(e) => setBuyerInfo({ ...buyerInfo, location: e.target.value })}
                      required
                    />
                  </div>
                  <div className="add-item-input-wrapper">
                    <label className="add-item-label">Image:</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="add-item-input-image"
                      onChange={(e) => setItemImage(e.target.files[0])}
                      required
                    />
                  </div>
                </div>

                <div className="add-item-input-wrapper-full">
                  <label className="add-item-label">Description:</label>
                  <textarea
                    className="add-item-input-description"
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="add-item-submit-btn">Add Item</button>
            </form>
          </div>
        </div>
      )}
    </div>
    </div>
    <Footer />
    </div>
  );
}

export default EventPage;
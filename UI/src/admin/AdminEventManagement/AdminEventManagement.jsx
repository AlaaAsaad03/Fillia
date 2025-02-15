import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import SchedulePopup from "../SchedulePopup/SchedulePopup";
import "./AdminEventManagement.css";

const AdminEventManagement = () => {
  // State and functions remain the same as your original code
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const token = localStorage.getItem("token");

  let adminId = null;
  let adminRole = "";
  console.log("Token",token);
  
  let type = null;

if (token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
    adminId = payload.id;
    adminRole = payload.role;

    if (!adminId) {
      console.error("Admin ID is missing from the token.");
    }
  } catch (error) {
    console.error("Invalid token format:", error);
  }
}

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    type: "Donation",
    startDate: "",
    endDate: "",
  });


  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/event/get", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const formattedEvents = response.data.data.map((event) => ({
          id: event._id,
          title: event.title,
          start: event.startDate,
          end: event.endDate,
          extendedProps: event,
        }));
        setEvents(formattedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
      // Set up an interval to fetch data every 5 seconds (or desired interval)
  const intervalId = setInterval(fetchEvents, 60000); 

  // Clean up the interval when the component is unmounted or token changes
  return () => clearInterval(intervalId);

  }, [token]);

  const handleDateClick = (info) => {
    setSelectedDate(info.dateStr);
    setShowEventModal(true);
  };

  const handleEventClick = (info) => {
    setSelectedEvent(info.event.extendedProps);
    setShowEventDetails(true);
  };

  const closeModal = () => {
    setShowEventModal(false);
    setShowEventDetails(false);
    setSelectedDate(null);
    setSelectedEvent(null);
  };

  const createEvent = async () => {
    try {
      // If no endDate is provided, set it to the same as the startDate
      const eventEndDate = newEvent.endDate || selectedDate;
  
      // Make sure endDate is at least the startDate to prevent events from spanning multiple days
      if (new Date(eventEndDate) < new Date(selectedDate)) {
        alert('End date must be after the start date.');
        return;
      }
  
      const response = await axios.post(
        "http://localhost:4000/api/event/schedule",
        {
          ...newEvent,
          startDate: selectedDate,
          endDate: eventEndDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      // Add the new event to the calendar after successful scheduling
      setEvents((prevEvents) => [
        ...prevEvents,
        {
          id: response.data.event._id,
          title: response.data.event.title,
          start: response.data.event.startDate,
          end: response.data.event.endDate,
        },
      ]);
      closeModal();
    } catch (error) {
      console.error("Error scheduling event:", error);
    }
  };
  

  const renderEventDetails = () => (
    <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-tomato">{selectedEvent.title}</h2>
        <p>{selectedEvent.description}</p>
        <p>
          <strong>Type:</strong> {selectedEvent.type.join(", ")}
        </p>
        <button onClick={closeModal} className="btn btn-danger mt-4 w-100">
          Close
        </button>
      </div>
    </motion.div>
  );

  const isAuthorized = adminRole === "Leader";

  return (
    <div className={`main-contentt ${!isAuthorized ? "blurred" : ""}`}>
      
    {!isAuthorized && (
      <div className="lock-overlay">
        <i className="lock-icon">🔒</i>
        <p>Access Restricted</p>
      </div>
    )} 
      <div className="py-5">
        <div className="mt-5" style={{ marginLeft: "25%", width: "50%" }}>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,dayGridWeek",
            }}
            eventColor="#ff6347" // Tomato for event highlights
          />
        </div>
      </div>
      {showEventModal && (
        <SchedulePopup
          newEvent={newEvent}
          setNewEvent={setNewEvent}
          createEvent={createEvent}
          closeModal={closeModal}
          selectedDate={selectedDate}
        />
      )}
      {showEventDetails && selectedEvent && renderEventDetails()}
    </div>
  );
};

export default AdminEventManagement;
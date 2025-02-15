import React from "react";
import { motion } from "framer-motion";
import "./SchedulePopup.css";

const SchedulePopup = ({
  newEvent = {}, // Default value to prevent undefined errors
  setNewEvent,
  createEvent,
  closeModal,
  selectedDate,
}) => {
  return (
    <motion.div
      className="schedule-popup-overlay"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className="schedule-popup-container">
        <h2 className="popup-title">Schedule an Event</h2>
        <div className="form-group">
          <label>Event Title</label>
          <input
            type="text"
            className="form-control"
            value={newEvent.title || ""}
            onChange={(e) =>
              setNewEvent({ ...newEvent, title: e.target.value })
            }
          />
        </div>
        <div className="form-group mt-3">
          <label>Event Description</label>
          <textarea
            className="form-control"
            value={newEvent.description || ""}
            onChange={(e) =>
              setNewEvent({ ...newEvent, description: e.target.value })
            }
          />
        </div>
        <div className="form-group mt-3">
          <label>Event Type</label>
          <select
            className="form-control"
            value={newEvent.type || "Donation"}
            onChange={(e) =>
              setNewEvent({ ...newEvent, type: e.target.value })
            }
          >
            <option value="Donation">Donation</option>
            <option value="Items">Items</option>
          </select>
        </div>
        <div className="form-group mt-3">
          <label>Event End Date</label>
          <input
            type="date"
            className="form-control"
            value={newEvent.endDate || ""}
            onChange={(e) =>
              setNewEvent({ ...newEvent, endDate: e.target.value })
            }
          />
        </div>
        <div className="button-group">
          <button onClick={createEvent} className="btn btn-primarry">
            Schedule 
          </button>
          <button onClick={closeModal} className="btn cancel-button">
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SchedulePopup;

import React from "react";
import CountDownCard from "./CountDownCard";
import "./CountDownTimer.css";

const CountDownTimer = ({ days, hours, minutes, seconds }) => {
  return (
    <div className="countdown__container">
      <CountDownCard label="Days" number={days} />
      <CountDownCard label="Hours" number={hours} />
      <CountDownCard label="Minutes" number={minutes} />
      <CountDownCard label="Seconds" number={seconds} />
    </div>
  );
};

export default CountDownTimer;

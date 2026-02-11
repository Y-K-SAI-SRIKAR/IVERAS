import React from "react";
import "./CyberCard.css";

const CyberCard = () => {
  return (
    <div className="container noselect">
      <div className="tracker"></div>

      <div id="card">
        <div className="card-content">
          <div className="id-content">
            <h3 className="id-title">USER ID</h3>
            <p>Name: Kavya</p>
            <p>Blood Group: O+</p>
            <p>Age: 21</p>
            <p>Gender: Female</p>
          </div>

          <div className="corner-elements">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>

          <div className="scan-line"></div>
        </div>
      </div>
    </div>
  );
};

export default CyberCard;

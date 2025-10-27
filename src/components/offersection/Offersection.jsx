import React from "react";
import "./offersection.css";
import { MdOutlineTimer } from "react-icons/md";
import percentImg from "../Assets/percent-img.png";

const OffersSection = () => {
  const offers = [
    {
      title: "Get flat 20% off upto ₹30000",
      desc: "Get flat 20% off upto ₹30000 on your cart value when buying any product!",
      code: "FESTIVE20",
      timer: null,
    },
    {
      title: "Get flat 25% off upto ₹30000",
      desc: "Get flat 25% off upto ₹30000 on your cart value when buying any product!",
      code: "COZY25",
      timer: null,
    },
    {
      title: "Get 20% off upto ₹1000",
      desc: "Apply this coupon to get 20% off upto ₹1000 on your first month rent",
      code: "FURMAX",
      timer: "10h:18m:57s",
    },
  ];

  return (
    <div className="offers-container">
      <div className="offers-header">
        <h2>Offers & Discounts</h2>
        <a href="#" className="see-all">
          See All →
        </a>
      </div>

      <div className="offers-scroll-wrapper">
        <div className="offers-list">
          {offers.map((offer, index) => (
            <div key={index} className="offer-card">
              <div className="offer-icon">
                <img src={percentImg} alt="percent" height={22} width={22} />
                <h3>{offer.title}</h3>
              </div>
              
              <p>{offer.desc}</p>
              <p className="coupon">
                Use Coupon Code : <strong>{offer.code}</strong>
              </p>

              {/* {offer.timer && (
                <div className="timer">
                  <MdOutlineTimer className="timer-icon" /> {offer.timer}
                </div>
              )} */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OffersSection;

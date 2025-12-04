import React, { useState } from "react";
import "./offersection.css";
import { MdOutlineTimer } from "react-icons/md";
import percentImg from "../Assets/percent-img.png";
import OfferCanva from "./OfferCanva";

const OffersSection = ({data}) => {
  const [offerCanva, setOfferCanva] = useState(false)
  // const offers = [
  //   {
  //     title: "Get flat 20% off upto...",
  //     desc: "Get flat 20% off upto ₹30,000 on your cart value when buying any product!",
  //     code: "COMFY20",
  //     timer: "12h:43m:12s",
  //   },
  //   {
  //     title: "Get flat 18% off upto...",
  //     desc: "Get flat 18% off upto ₹25,000 on your cart value when buying any product!",
  //     code: "FUR18",
  //     timer: "12h:43m:12s",
  //   },
  //   {
  //     title: "Get 22% off upto ₹1050",
  //     desc: "Apply this coupon to get 22% off upto ₹1050 on your first month rent. Great reason to start renting today!",
  //     code: "MAXSAVING",
  //     timer: null,
  //   },
  //   {
  //     title: "Get 20% off upto ₹1000",
  //     desc: "Apply this coupon to get 20% off upto ₹1000 on your first month rent",
  //     code: "FURMAX",
  //     timer: "12h:43m:12s",
  //   },
  // ];

  return (
    <div className="offers-container">
      <div className="offers-header">
        <h2>Offers & Discounts</h2>
        <div className="see-all" onClick={()=> setOfferCanva(true)}>
          See All →
        </div>
      </div>

      <div className="offers-scroll-wrapper">
        <div className="offers-list">
          {data.map((offer, index) => (
            <div key={index} className="offer-card">
              <div className="offer-icon-row">
                <img src={percentImg} alt="percent" height={22} width={22} />
                <h3>{offer.title}</h3>
              </div>

              <p>{offer.description}</p>

              <p className="coupon">
                Use Coupon Code : <strong>{offer.code}</strong>
              </p>
            </div>
          ))}
        </div>
      </div>
      <OfferCanva  offerCanva={offerCanva}  handleClose={() => setOfferCanva(false)} data={data} />
    </div>
  );
};

export default OffersSection;

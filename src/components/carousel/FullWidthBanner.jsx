import React, { useState } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import "./FullWidthBanner.css";
import { useNavigate } from "react-router-dom";

function FullWidthBanner({ data }) {
  // const banners = [
  //   "https://assets.furlenco.com/image/upload/dpr_2.0,f_auto,q_auto/v1/s3-furlenco-images/evolve_2_0/newbrand_banner_unlmtd_slim_2.jpg",
  //   "https://assets.furlenco.com/image/upload/dpr_2.0,f_auto,q_auto/v1/s3-furlenco-images/evolve_2_0/kids_new_slim_apps.png",
  //   "https://assets.furlenco.com/image/upload/dpr_2.0,f_auto,q_auto/v1/s3-furlenco-images/evolve_2_0/referral_pitch_slim_no_cta.jpg",
  // ];
  let navigate = useNavigate()
  const [current, setCurrent] = useState(0);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? data.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev === data.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="hc-container">
      <button className="hc-arrow hc-left" onClick={prevSlide}>
        <IoChevronBack className="hc-arrow-icon" />
      </button>

      <div
        className="hc-slider"
        style={{ transform: `translateX(-${current * 100}%)` }}
        
      >
        {data.map((item, index) => (
          <div className="hc-slide" key={index} onClick={() => navigate(`${item.mapped_type}/${item.cat_slug}`)}>
            <img src={item.image__image} alt={`banner-${index}`} className="hc-image" />
          </div>
        ))}
      </div>

      <button className="hc-arrow hc-right" onClick={nextSlide}>
        <IoChevronForward className="hc-arrow-icon" />
      </button>
    </div>
  );
}

export default FullWidthBanner;

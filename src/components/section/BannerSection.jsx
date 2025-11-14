import React, { useRef } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { FaArrowRight } from "react-icons/fa";
import "./bannersection.css";
import { IoIosArrowRoundForward } from "react-icons/io";
import { useNavigate } from "react-router-dom";

function BannerSection() {
  const scrollRef = useRef(null);

  const banners = [
    {
      id: 1,
      img: "https://assets.furlenco.com/image/upload/dpr_2.0,f_auto,q_auto/v1/s3-furlenco-images/evolve_2_0/diwali2025_banner_rent_desktop_1.jpg",
    },
    {
      id: 2,
      img: "https://assets.furlenco.com/image/upload/dpr_2.0,f_auto,q_auto/v1/s3-furlenco-images/evolve_2_0/newbrand_banner_unlmtd_desktop_1.jpg",
    },
    {
      id: 3,
      img: "https://assets.furlenco.com/image/upload/dpr_2.0,f_auto,q_auto/v1/s3-furlenco-images/evolve_2_0/diwali2025_banner_buy_desktop.jpg",
    },
    {
      id: 4,
      img: "https://assets.furlenco.com/image/upload/dpr_2.0,f_auto,q_auto/v1/s3-furlenco-images/evolve_2_0/kids_new_web.png",
    },
    {
      id: 5,
      img: "https://assets.furlenco.com/image/upload/dpr_2.0,f_auto,q_auto/v1/s3-furlenco-images/evolve_2_0/newbrand_banner_genz_rent_desktop_2.jpg",
    },
  ];
  let navigate = useNavigate()
  const scroll = (dir) => {
    const { current } = scrollRef;
    if (current) {
      const cardWidth = current.querySelector(".banner-card").offsetWidth + 20; // 20 for gap
      current.scrollBy({
        left: dir === "left" ? -cardWidth : cardWidth,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="banner-section">
      <div className="banner-carousel-wrapper">
        <button className="banner-arrow left" onClick={() => scroll("left")}>
          <IoChevronBack />
        </button>

        <div className="banner-carousel" ref={scrollRef}>
          {banners.map((item) => (
            <div className="banner-card" key={item.id}>
              <img src={item.img} alt={item.title} />

            </div>
          ))}
          <div className="banner-btn">
            <div className="buy" onClick={() => {navigate("/buy"); window.scrollTo({top : 0, behavior:"smooth"})} }>Buy Product <IoIosArrowRoundForward className="banner-btn-icon" /> </div>
            <div className="rent" onClick={() => {navigate("/rent"); window.scrollTo({top : 0, behavior:"smooth"})}}>Rent product <IoIosArrowRoundForward className="banner-btn-icon" /></div>
            {/* <div className="unlmtd">UNLMTD <IoIosArrowRoundForward className="banner-btn-icon" /></div> */}
          </div>
        </div>

        <button className="banner-arrow right" onClick={() => scroll("right")}>
          <IoChevronForward />
        </button>
      </div>
    </div>
  );
}

export default BannerSection;

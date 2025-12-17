import React, { useRef } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { FaArrowRight } from "react-icons/fa";
import "./multiplebanner.css";
import { IoIosArrowRoundForward } from "react-icons/io";
import { useNavigate } from "react-router-dom";

function MultipleBannerSection({ data }) {
  const scrollRef = useRef(null);
  let navigate = useNavigate()
  // const scroll = (dir) => {
  //   const { current } = scrollRef;
  //   if (current) {
  //     const cardWidth = current.querySelector(".banner-card").offsetWidth + 20; // 20 for gap
  //     current.scrollBy({
  //       left: dir === "left" ? -cardWidth : cardWidth,
  //       behavior: "smooth",
  //     });
  //   }
  // };
  const scroll = (dir) => {
    const { current } = scrollRef;
    if (current) {
      const firstCard = current.querySelector(".mul-banner-card");
      if (!firstCard) return; // safeguard

      const cardWidth = firstCard.offsetWidth + 20; // width + gap

      current.scrollBy({
        left: dir === "left" ? -cardWidth : cardWidth,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="mul-banner-section">
      <div className="mul-banner-carousel-wrapper">
        <button className="banner-arrow left" onClick={() => scroll("left")}>
          <IoChevronBack />
        </button>

        <div className="mul-banner-carousel" ref={scrollRef}>
          {data?.map((item) => (
            <div className="mul-banner-card" key={item.id} onClick={() => navigate(`${item.mapped_type}/${item.cat_slug}`)}>
              <img src={item.image__image} alt={item.name} />

            </div>
          ))}
          {/* <div className="mul-banner-btn">
            <div className="buy" onClick={() => {navigate("/buy"); window.scrollTo({top : 0, behavior:"smooth"})} }>Buy Product <IoIosArrowRoundForward className="banner-btn-icon" /> </div>
            <div className="rent" onClick={() => {navigate("/rent"); window.scrollTo({top : 0, behavior:"smooth"})}}>Rent product <IoIosArrowRoundForward className="banner-btn-icon" /></div>
          </div> */}
        </div>

        <button className="mul-banner-arrow right" onClick={() => scroll("right")}>
          <IoChevronForward />
        </button>
      </div>
    </div>
  );
}

export default MultipleBannerSection;

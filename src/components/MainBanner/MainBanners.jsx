import React, { useState, useEffect } from "react";
import "./MainBanner.css";
import Slider from "react-slick";
import { NavLink } from "react-router-dom";

const MainBanners = ({ data }) => {
  function SampleNextArrow(props) {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{ ...style, display: "none", background: "red" }}
        onClick={onClick}
      />
    );
  }

  function SamplePrevArrow(props) {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{ ...style, display: "none", background: "green" }}
        onClick={onClick}
      />
    );
  }
  var settings = {
    className: "center",
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
  };

  return (
    <div className="text-center">
      <Slider {...settings}>
        {data?.length > 0 &&
          data?.map((item, index) => {
            return (
              <div className="container fullwidth-banner" key={index}>
                <NavLink to={item.sub_slug ? item.sub_slug : "#"}>
                  <img
                    src={item.image__image ? item.image__image : item.image}
                    className="main-banner"
                    alt="banner"
                  />
                </NavLink>
              </div>
            );
          })}
      </Slider>
    </div>
  );
};
export default MainBanners;

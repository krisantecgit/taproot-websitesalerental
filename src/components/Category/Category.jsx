import React, { useEffect, useState, useRef } from "react";
import axiosConfig from "../../Services/axiosConfig";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";

import { Navigation, Autoplay } from "swiper/modules";

import "./category.css";
import loader from "../Assets/spinner.gif";
import { useNavigate } from "react-router-dom";

const Category = ({ listingType }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  let navigate = useNavigate();
  const swiperRef = useRef(null);

  async function fetchCategories() {
    try {
      const res = await axiosConfig.get(`/catlog/with-${listingType}-or-both/?is_suspended=false`);
      setCategories(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, [listingType]);

  function handleCategoryClick(slug) {
    navigate(`/${listingType}/${slug}`);
  }

  if (loading) {
    return (
      <div className="loader-container">
        <img src={loader} alt="Loading..." className="loader-gif" />
      </div>
    );
  }

  return (
    <div className="buypage-container">
      <h2>{listingType === "buy" ? "Buy Furniture" : "Rent Furniture"}</h2>
      <div className="buypage-category">
        {categories.length > 0 ? (
          <div className="swiper-wrapper-container">
            <Swiper
              ref={swiperRef}
              modules={[Navigation, Autoplay]}
              navigation={{
                nextEl: '.custom-next-btn',
                prevEl: '.custom-prev-btn',
              }}
              autoplay={{
                delay: 2500,
                disableOnInteraction: false,
              }}
              loop={true}
              spaceBetween={40}
              slidesPerView={6}
              breakpoints={{
                320: { slidesPerView: 2 },
                480: { slidesPerView: 3 },
                768: { slidesPerView: 4 },
                1024: { slidesPerView: 6 },
              }}
            >
              {categories.map((item) => (
                <SwiperSlide key={item.id}>
                  <div
                    className="card-buy"
                    onClick={() => handleCategoryClick(item.slug)}
                  >
                    <img src={item.image?.image} alt={item.name} />
                    <h3>{item.name}</h3>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            
            {/* Custom Small Navigation Buttons */}
            <button 
              className="custom-nav-btn custom-prev-btn"
              onClick={() => swiperRef.current?.swiper?.slidePrev()}
            >
              <svg width="12" height="12" viewBox="0 0 24 24">
                <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" fill="currentColor"/>
              </svg>
            </button>
            
            <button 
              className="custom-nav-btn custom-next-btn"
              onClick={() => swiperRef.current?.swiper?.slideNext()}
            >
              <svg width="12" height="12" viewBox="0 0 24 24">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        ) : (
          <div className="d-flex justify-content-center align-items-center">
            No Products Found
          </div>
        )}
      </div>
    </div>
  );
};

export default Category;
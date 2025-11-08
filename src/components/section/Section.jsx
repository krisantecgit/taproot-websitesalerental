import React, { useEffect, useRef, useState } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import "./section.css";
import { IoIosArrowRoundForward } from "react-icons/io";
import axiosConfig from "../../Services/axiosConfig"
import { useNavigate } from "react-router-dom";
function Section({ listingType }) {
  const scrollRef = useRef(null);
  const [products, setProducts] = useState([])
  let navigate = useNavigate();
  const fetchProducts = async () => {
    try {
      const res = await axiosConfig.get(`/catlog/category-variants/?listing_type=${listingType}`)
      setProducts(res?.data?.results);
    } catch (error) {
      console.log(error)
    }
  }
  function handleNavigate(product) {
    navigate(`/${listingType}/product/${product.slug}`, {
      state: { item: product, listingType: product.varient_listing_type }
    });
  }
  useEffect(() => {
    fetchProducts()
  }, [])
  console.log(products, "poiuyf")
  const scroll = (dir) => {
    const { current } = scrollRef;
    if (current) {
      const scrollAmount = current.offsetWidth;
      current.scrollBy({
        left: dir === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };
  const formatPrice = (price) =>
    price?.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).replace("$", "$ ");
  return (
    <div className="section">
      <div className="section-header">
        <div>
          <h2>Tailored for you</h2>
          <p>See what's popular</p>
        </div>
        <div className="view-all">
          View All <IoIosArrowRoundForward />
        </div>
      </div>

      <div className="carousel-wrapper">
        <button className="arrow-section left" onClick={() => scroll("left")}>
          <IoChevronBack className="arrow-icons" />
        </button>

        <div className="carousel" ref={scrollRef}>
          {products.map((product) => (
            <div className="card" key={product.id} onClick={() => handleNavigate(product)}>
              {product.images && product.images.length > 0 && (
                <img
                  src={product.images[0]?.image?.image}
                  alt={product.name}
                />
              )}
              <div className="card-body">
                <h4>{product.name}</h4>
                <div className="price-box">
                  <span className="tag">{product.varient_listing_type}</span>
                  <div className="price-row">
                    <span className="price">{formatPrice(product.prices.sale_offer_price)}</span>
                    <span className="discount">

                      {Math.round(
                        ((product?.prices?.sale_offer_price -
                          product?.prices?.sale_price) /
                          product?.prices?.sale_offer_price) *
                        100
                      )}
                      % OFF
                    </span>
                    <span className="old-price">{formatPrice(product?.prices?.sale_price)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="arrow-section right" onClick={() => scroll("right")}>
          <IoChevronForward className="arrow-icons" />
        </button>
      </div>
    </div>
  );
}

export default Section;

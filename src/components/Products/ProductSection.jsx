
import React, { useState, useRef } from "react";
import loader from "../Assets/spinner.gif";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./product.css";
import { FaArrowRight, FaTrash } from "react-icons/fa";
import { FaPalette, FaRuler } from "react-icons/fa";
import axiosConfig from "../../Services/axiosConfig";

function ImageSlider({ images, product }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef(null);

  function startSlide() {
    if (images.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 1200);
  }

  function stopSlide() {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setActiveIndex(0);
  }

  return (
    <div
      className="image-slide"
      onMouseEnter={startSlide}
      onMouseLeave={stopSlide}
    >
      {images.map((im, index) => (
        <img
          key={index}
          src={im?.image?.image}
          alt={im?.image?.name || product.name}
          className={`slide-image ${index === activeIndex ? "active" : ""}`}
        />
      ))}
    </div>
  );
}

function ProductSection({ products = [], loading = false, searchListingType, onRefresh }) {
  const location = useLocation();

  const navigate = useNavigate();
  const { categoryurl } = useParams();

  const formatPrice = (price) =>
    price?.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    }).replace("$", "$ ");

  function getListingType(product) {
    if (location.pathname.includes("/search/results")) {
      if (searchListingType === "buy") return "sale";
      if (searchListingType === "rent") return "rental";

      if (product.varient_listing_type === "buy/rent") return "buy/rent";
      if (product.varient_listing_type === "buy") return "sale";
      if (product.varient_listing_type === "rent") return "rental";
    }
    if (product.wishlistType) {
      return product.wishlistType === "sale" ? "sale" : "rental";
    }
    if (categoryurl === "buy") {
      return "sale";
    }
    if (categoryurl === "rent") {
      return "rental";
    }

    return "rental";
  }

  function handleNavigate(product) {
    const listingType = getListingType(product);

    const urlType = listingType === "rental" ? "rent" : "buy";

    navigate(`/${urlType}/product/${product.slug}`, {
      state: { item: product, listingType: urlType }
    });
  }
  async function removeProduct(id) {
    try {
      await axiosConfig.delete(`/catlog/wishlists/${id}/`)
      if (onRefresh) onRefresh()
    } catch (error) {
      console.log(error)
    }
  }
  if (loading) return <img src={loader} alt="loading" />;

  if (!loading && products.length === 0) return <p className="d-flex justify-content-center align-items-center">No products found.</p>;

  return (
    <div className="products">
      {loading ? (
        <img src={loader} alt="loading" />
      ) : (
        products.map((product) => {
          console.log(product, "llllllll")
          const listingType = getListingType(product);
          return (
            <div
              className="product-card"
              key={product.id}
              onClick={() => handleNavigate(product)}
            >
              <ImageSlider images={product.images || []} product={product} />

              <div className="product-card-body">
                <h4 className="product-name">{product.name}</h4>

                {product.options && product.options.length > 0 && (
                  <div className="product-options-grid">
                    {product.options.map((opt) => (
                      <div className="product-option-item" key={opt.id}>

                        <div className="option-text">
                          <span className="option-label">{opt.variant_type}:</span>
                          <span className="option-value">{opt.variant_option}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="product-price-box">
                  <span className="product-tag">{listingType === "buy/rent" ? "buy / rent" : listingType}</span>

                  <div className="product-price-row">
                    {listingType === "sale" && (
                      <>
                        {Number(product.prices?.sale_offer_price) > 0 ? (
                          <div className="price-row">
                            <span className="offer-price">{formatPrice(product.prices.sale_offer_price)}</span>
                            <span className="product-old-price">{formatPrice(product.prices.sale_price)}</span>
                            <span className="discount-badge">
                              {Math.round(
                                ((product.prices.sale_price - product.prices.sale_offer_price) /
                                  product.prices.sale_price) * 100
                              )}% OFF
                            </span>
                          </div>
                        ) : (
                          <div className="price-row">
                            <span className="offer-price">{formatPrice(product.prices.sale_price)}</span>
                          </div>
                        )}

                      </>
                    )}

                    {listingType === "rental" && product.prices?.rental_price && (
                      <div className="offer-price">
                        {formatPrice(product.prices.rental_price)} / Day
                      </div>
                    )}

                    {listingType === "buy/rent" && (
                      <div className="price-row dual-price-row">
                        <span className="offer-price">
                          {formatPrice(
                            Number(product.prices?.sale_offer_price) > 0
                              ? product.prices?.sale_offer_price
                              : product.prices?.sale_price
                          )}
                        </span>
                        {product.prices?.rental_price && (
                          <span className="dual-rental-price">
                            {formatPrice(product.prices.rental_price)} / Day
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {product.sale_stock === 0 ? (
                    <div className="stock-error">Out of stock</div>
                  ) : product.is_low_stock === "lowstock" ? (
                    <div className="stock-error">Limited stock available</div>
                  ) : null}

                  <div className="hover-icon">
                    {
                      location.pathname === "/my/wishlist" ? <FaTrash onClick={(e) => { e.stopPropagation(); removeProduct(product.wishlistId); }} className="delete-icon" /> : <FaArrowRight className="forward-icon" />
                    }
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default ProductSection;


import React, { useState, useRef } from "react";
import loader from "../Assets/spinner.gif";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./product.css";
import { FaArrowRight, FaTrash } from "react-icons/fa";
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
      return searchListingType === "buy" ? "sale" : "rental";
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
    const listingType = getListingType(searchListingType || product);

    const urlType = listingType === "sale" ? "buy" : "rent";

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
                <div className="product-price-box">
                  <span className="product-tag">{listingType}</span>

                  <div className="product-price-row">
                    {/* For sale products */}
                    {listingType === "sale" && (
                      <>
                        {Number(product.prices?.sale_offer_price) > 0 ? (
                          <>
                            {/* Offer price */}
                            <div className="offer-price">
                              {formatPrice(product.prices.sale_offer_price)}
                            </div>

                            {/* Old price + discount */}
                            <div className="product-price-section">
                              <div className="product-discount">
                                {Math.round(
                                  ((product.prices.sale_price -
                                    product.prices.sale_offer_price) /
                                    product.prices.sale_price) *
                                  100
                                )}
                                % OFF
                              </div>
                              <div className="product-price product-old-price">
                                {formatPrice(product.prices.sale_price)}
                              </div>

                            </div>
                          </>
                        ) : (
                          // No offer → show only normal price
                          <div className="offer-price">
                            {formatPrice(product.prices.sale_price)}
                          </div>
                        )}
                      </>
                    )}

                    {/* For rental products */}
                    {listingType === "rental" && product.prices?.rental_price && (
                      <div className="offer-price">
                        {formatPrice(product.prices.rental_price)} / Day
                      </div>
                    )}
                  </div>
                  {product.sale_stock <= product.debug?.applied_threshold && (
                    <div className="stock-error">Product going to out of stock</div>
                  )}
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

import React, { useState } from 'react'
import "./product.css"
import { useRef } from 'react';
import Header from '../header/Header';
import { IoArrowDown, IoArrowForward, IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { TiTick } from 'react-icons/ti';
import { FaCheck } from 'react-icons/fa6';

function Product() {
  const [isActive, setIsActive] = useState("Kids Room")
  const products = [
    {
      id: 1,
      name: "Hako Solid Wood Bedside Table in Timeless Teak Finish",
      price: "₹209/mo",
      oldPrice: "₹316/mo",
      discount: "-34%",
      tag: "Rent",
      img: "https://assets.furlenco.com/image/upload/dpr_2.0,f_auto,q_auto/v1/plutus/products/6673/thumbnail/gallery_1.jpg",
    },
    {
      id: 2,
      name: "Taki Solid Wood Bedside Table in Timeless Teak Finish",
      price: "₹209/mo",
      oldPrice: "₹316/mo",
      discount: "-34%",
      tag: "Rent",
      img: "https://assets.furlenco.com/image/upload/dpr_2.0,f_auto,q_auto/v1/plutus/products/6972/thumbnail/Furlenco%202.0-13312.jpg",
    },
    {
      id: 3,
      name: "Slay Engineered Wood Center Table",
      price: "₹209/mo",
      oldPrice: "₹316/mo",
      discount: "-34%",
      tag: "Rent",
      img: "https://assets.furlenco.com/image/upload/dpr_2.0,f_auto,q_auto/v1/plutus/products/4434/thumbnail/gallery_1.jpg",
    },
    {
      id: 4,
      name: "Kapa Engineered Wood Center Table",
      price: "₹259/mo",
      oldPrice: "₹391/mo",
      discount: "-34%",
      tag: "Rent",
      img: "https://assets.furlenco.com/image/upload/dpr_2.0,f_auto,q_auto/v1/plutus/products/398/thumbnail/gallery_1.jpg",
    },
    {
      id: 5,
      name: "Kapa Engineered Wood Center Table",
      price: "₹259/mo",
      oldPrice: "₹391/mo",
      discount: "-34%",
      tag: "Rent",
      img: "https://assets.furlenco.com/image/upload/dpr_2.0,f_auto,q_auto/v1/plutus/products/7513/thumbnail/plp_1.jpg",
    },
    {
      id: 6,
      name: "Kids Basic study sollution",
      price: "₹259/mo",
      oldPrice: "₹391/mo",
      discount: "-34%",
      tag: "Rent",
      img: "https://assets.furlenco.com/image/upload/dpr_2.0,f_auto,q_auto/v1/plutus/products/5989/hero/gallery_1%20(1).jpg",
    },
    {
      id: 7,
      name: "Marry kids play table",
      price: "₹259/mo",
      oldPrice: "₹391/mo",
      discount: "-34%",
      tag: "Rent",
      img: "https://assets.furlenco.com/image/upload/dpr_2.0,f_auto,q_auto/v1/plutus/products/7513/thumbnail/plp_1.jpg",
    },
    {
      id: 8,
      name: "Kids open storage",
      price: "₹259/mo",
      oldPrice: "₹391/mo",
      discount: "-34%",
      tag: "Rent",
      img: "https://assets.furlenco.com/image/upload/dpr_2.0,f_auto,q_auto/v1/plutus/products/6834/hero/1.jpg",
    },
    {
      id: 8,
      name: "Kids small storage unit",
      price: "₹259/mo",
      oldPrice: "₹391/mo",
      discount: "-34%",
      tag: "Rent",
      img: "https://assets.furlenco.com/image/upload/dpr_2.0,f_auto,q_auto/v1/plutus/products/7158/hero/gallery_1a.jpg",
    },
  ];
  const categories = [
    "Kids Room",
    "Bedroom",
    "Living Room",
    "Appliances",
    "BHK Combos",
    "Storage",
    "Study",
    "Dining",
    "Z Rated",
    "Festival Deals",
    "Fitness",
    "Mattress",
    "Luxury",
    "99 Store",
    "Electronics",
    "Grocery",
    "Fashion",
    "Toys",
    "Pet Supplies",
  ];
  const carouselRef = useRef(null);

  const scrollLeft = () => {
    carouselRef.current.scrollBy({ left: -200, behavior: "smooth" });
  };

  const scrollRight = () => {
    carouselRef.current.scrollBy({ left: 200, behavior: "smooth" });
  };


  return (
    <>
      <Header />
      <div className='product-container'>
        <div className="carousel-container">
          <button onClick={scrollLeft} className="scroll-btn left">
            <IoChevronBack className="arrow-icons" />
          </button>

          <div className="carousel" ref={carouselRef}>
            {categories.map((cat, idx) => (
              <div key={idx} onClick={() => setIsActive(cat)} className={`category-item ${isActive === cat ? "active" : ""}`}>
                {cat}
              </div>
            ))}
          </div>

          <button onClick={scrollRight} className="scroll-btn right">
            <IoChevronForward className="arrow-icons" />
          </button>
        </div>
        <div className="filter-section">
          <div className="filters-left">
            <div className='filter'>FILTER</div>
            <div className="filter-box">
              Sub-Category
              <div className="dropdown">
                <label><input type="checkbox" /> Tables</label>
                <label><input type="checkbox" /> Chairs</label>
                <label><input type="checkbox" /> Sofas</label>
                <label><input type="checkbox" /> Beds</label>
              </div>
              <div><IoArrowDown /></div>
            </div>

            <div className="filter-box">
              Price Range
              <div className="dropdown">
                <label><input type="checkbox" /> ₹0 - ₹5000</label>
                <label><input type="checkbox" /> ₹5000 - ₹10,000</label>
                <label><input type="checkbox" /> ₹10,000 - ₹20,000</label>
              </div>
              <div><IoArrowDown /></div>
            </div>

            <div className="filter-box">
              More Options
              <div className="dropdown">
                <label><input type="checkbox" /> Material</label>
                <label><input type="checkbox" /> Brand</label>
                <label><input type="checkbox" /> Availability</label>
              </div>
              <div><IoArrowForward /></div>
            </div>
          </div>

          <div className="sort-right">
            <div className='sortby'>SORT BY</div>
            <div className="filter-box sort-box">
              Featured
              <div className="dropdown">
                <div className="sort-option active">
                  Featured <span className="checkmark">✔</span>
                </div>
                <div className="sort-option">Name A-Z</div>
                <div className="sort-option">Name Z-A</div>
                <div className="sort-option">Price - Low to High</div>
                <div className="sort-option">Price - High to Low</div>
              </div>
              <div><FaCheck /></div>
            </div>
          </div>
        </div>


        <div className="products">
          {products.map((item) => (
            <div className="product-card" key={item.id}>
              <img src={item.img} alt={item.name} />
              <div className="product-card-body">
                <h4>{item.name}</h4>
                <div className="product-price-box">
                  <span className="product-tag">{item.tag}</span>
                  <div className="product-price-row">
                    <div className="product-price">{item.price}</div>
                    <div className='product-price-section'>
                      <div className="product-discount">{item.discount}</div>
                      <div className="product-old-price">{item.oldPrice}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default Product
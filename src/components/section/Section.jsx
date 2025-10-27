import React, { useRef } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import "./section.css";
import { IoIosArrowRoundForward } from "react-icons/io";

function Section() {
  const scrollRef = useRef(null);

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
  ];

  const scroll = (dir) => {
    const { current } = scrollRef;
    if (current) {
      const scrollAmount = current.offsetWidth; // one full view width
      current.scrollBy({
        left: dir === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

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
        <button className="arrow left" onClick={() => scroll("left")}>
          <IoChevronBack className="arrow-icons" />
        </button>

        <div className="carousel" ref={scrollRef}>
          {products.map((item) => (
            <div className="card" key={item.id}>
              <img src={item.img} alt={item.name} />
              <div className="card-body">
                <h4>{item.name}</h4>
                <div className="price-box">
                  <span className="tag">{item.tag}</span>
                  <div className="price-row">
                    <span className="price">{item.price}</span>
                    <span className="discount">{item.discount}</span>
                    <span className="old-price">{item.oldPrice}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="arrow right" onClick={() => scroll("right")}>
          <IoChevronForward className="arrow-icons" />
        </button>
      </div>
    </div>
  );
}

export default Section;

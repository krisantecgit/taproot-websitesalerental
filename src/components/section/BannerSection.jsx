// import React, { useRef } from "react";
// import { IoChevronBack, IoChevronForward } from "react-icons/io5";
// import { FaArrowRight } from "react-icons/fa";
// import "./bannersection.css";
// import { IoIosArrowRoundForward } from "react-icons/io";
// import { useNavigate } from "react-router-dom";

// function BannerSection({data}) {
//   const scrollRef = useRef(null);
//   let navigate = useNavigate()
//   const scroll = (dir) => {
//     const { current } = scrollRef;
//     if (current) {
//       const cardWidth = current.querySelector(".banner-card").offsetWidth + 20; // 20 for gap
//       current.scrollBy({
//         left: dir === "left" ? -cardWidth : cardWidth,
//         behavior: "smooth",
//       });
//     }
//   };

//   return (
//     <div className="banner-section">
//       <div className="banner-carousel-wrapper">
//         <button className="banner-arrow left" onClick={() => scroll("left")}>
//           <IoChevronBack />
//         </button>

//         <div className="banner-carousel" ref={scrollRef}>
//           {data?.map((item) => (
//             <div className="banner-card" key={item.id} onClick={()=> navigate(`${item.mapped_type}/${item.cat_slug}`)}>
//               <img src={item.image__image} alt={item.name} />

//             </div>
//           ))}
//           <div className="banner-btn">
//             <div className="buy" onClick={() => {navigate("/buy"); window.scrollTo({top : 0, behavior:"smooth"})} }>Buy Product <IoIosArrowRoundForward className="banner-btn-icon" /> </div>
//             <div className="rent" onClick={() => {navigate("/rent"); window.scrollTo({top : 0, behavior:"smooth"})}}>Rent product <IoIosArrowRoundForward className="banner-btn-icon" /></div>
//             {/* <div className="unlmtd">UNLMTD <IoIosArrowRoundForward className="banner-btn-icon" /></div> */}
//           </div>
//         </div>

//         <button className="banner-arrow right" onClick={() => scroll("right")}>
//           <IoChevronForward />
//         </button>
//       </div>
//     </div>
//   );
// }

// export default BannerSection;
import React, { useRef, useEffect } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { IoIosArrowRoundForward } from "react-icons/io";
import "./bannersection.css";
import { useNavigate } from "react-router-dom";

function BannerSection({ data = [] }) {
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  // duplicate data for infinite effect
  const infiniteData = [...data, ...data];

  const scroll = (dir) => {
    const current = scrollRef.current;
    if (!current) return;

    const cardWidth =
      current.querySelector(".banner-card")?.offsetWidth + 20;

    current.scrollBy({
      left: dir === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };

  // 🔁 Auto slide
  useEffect(() => {
    const current = scrollRef.current;
    if (!current) return;

    const cardWidth =
      current.querySelector(".banner-card")?.offsetWidth + 20;

    const interval = setInterval(() => {
      current.scrollBy({
        left: cardWidth,
        behavior: "smooth",
      });

      // reset scroll for infinite loop
      if (current.scrollLeft >= current.scrollWidth / 2) {
        setTimeout(() => {
          current.scrollLeft = 0;
        }, 600); // same as transition time
      }
    }, 3000); // auto slide speed

    return () => clearInterval(interval);
  }, [data]);

  return (
    <div className="banner-section">
      <div className="banner-carousel-wrapper">
        <button className="banner-arrow left" onClick={() => scroll("left")}>
          <IoChevronBack />
        </button>

        <div className="banner-carousel" ref={scrollRef}>
          {infiniteData.map((item, index) => (
            <div
              className="banner-card"
              key={index}
              onClick={() =>
                navigate(`${item.mapped_type}/${item.cat_slug}`)
              }
            >
              <img src={item.image__image} alt={item.name} />
            </div>
          ))}

          <div className="banner-btn">
            <div
              className="buy"
              onClick={() => {
                navigate("/buy");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Buy Product <IoIosArrowRoundForward />
            </div>

            <div
              className="rent"
              onClick={() => {
                navigate("/rent");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Rent Product <IoIosArrowRoundForward />
            </div>
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

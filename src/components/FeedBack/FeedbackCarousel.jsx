import React, { useState, useEffect } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import "./feedbackcarousel.css";

function FeedbackCarousel() {
    const banners = [
        "https://assets.furlenco.com/image/upload/dpr_2.0,f_auto,q_auto/v1/s3-furlenco-images/evolve_2_0/testimonial_web1.jpg",
        "https://assets.furlenco.com/image/upload/dpr_2.0,f_auto,q_auto/v1/s3-furlenco-images/evolve_2_0/testimonial_web2.jpg",
        "https://assets.furlenco.com/image/upload/dpr_2.0,f_auto,q_auto/v1/s3-furlenco-images/evolve_2_0/testimonial_web3.jpg",
        "https://assets.furlenco.com/image/upload/dpr_2.0,f_auto,q_auto/v1/s3-furlenco-images/evolve_2_0/testimonial_web4.jpg",
        "https://assets.furlenco.com/image/upload/dpr_2.0,f_auto,q_auto/v1/s3-furlenco-images/evolve_2_0/testimonial_web5.jpg"
    ];

    const [current, setCurrent] = useState(0);
    const [visibleSlides, setVisibleSlides] = useState(3);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setVisibleSlides(1);
            } else if (window.innerWidth < 1024) {
                setVisibleSlides(2);
            } else {
                setVisibleSlides(3);
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const totalGroups = Math.ceil(banners.length / visibleSlides);

    const prevSlide = () => {
        setCurrent((prev) => (prev === 0 ? totalGroups - 1 : prev - 1));
    };

    const nextSlide = () => {
        setCurrent((prev) => (prev === totalGroups - 1 ? 0 : prev + 1));
    };

    return (
        <div className="fb-container">
            <div className="fb-header">
                <img
                    src="https://assets.furlenco.com/image/upload/dpr_2.0,f_auto,q_auto/v1/s3-furlenco-images/evolve_2_0/smiling-face.png"
                    alt="Smiling face"
                    className="fb-header-img"
                />
                <div>
                    <h3>Our Customers Love</h3>
                    <p>OUR PRODUCTS AND SERVICES</p>
                </div>
            </div>

            <div className="fb-carousel-wrapper">
                <button className="fb-arrow fb-left" onClick={prevSlide}>
                    <IoChevronBack className="fb-arrow-icon" />
                </button>

                <div
                    className="fb-slider"
                    style={{
                        transform: `translateX(-${current * (100 / totalGroups)}%)`,
                        width: `${(banners.length / visibleSlides) * 100}%`,
                    }}
                >
                    {banners.map((img, index) => (
                        <div
                            className="fb-slide"
                            key={index}
                            style={{ flex: `0 0 ${100 / visibleSlides}%` }}
                        >
                            <img src={img} alt={`feedback-${index}`} className="fb-image" />
                        </div>
                    ))}
                </div>

                <button className="fb-arrow fb-right" onClick={nextSlide}>
                    <IoChevronForward className="fb-arrow-icon" />
                </button>
            </div>
        </div>
    );
}

export default FeedbackCarousel;

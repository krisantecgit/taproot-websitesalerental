import React, { useEffect, useState } from "react";
import Header from "../header/Header";
import Section from "../section/Section";
import BannerSection from "../section/BannerSection";
import OffersSection from "../offersection/Offersection";
import FeedbackCarousel from "../FeedBack/FeedbackCarousel";
import AdvertiseBanner from "../AdvertiseBanner/AdvertiseBanner";
import Footer from "../Footer/Footer";
import axiosConfig from "../../Services/axiosConfig";
import FullWidthBanner from "../carousel/FullWidthBanner";
import MultipleBannerSection from "../MultipleBanners/MultipleBanners";
import "./homepage.css"

function Home() {
    const [components, setComponents] = useState([]);

    const getData = async () => {
        try {
            const res = await axiosConfig("/cms/get_homepagedesign/?type=home%20page");
            let data = res?.data?.results || [];

            // 1️⃣ Sort data by sort key
            data = data.sort((a, b) => a.sort - b.sort);

            // 2️⃣ Normalize into a clean array
            const mapped = data.map((item) => {
                switch (item.title) {
                    case "Banner Slider":
                        return { type: "banner", content: item.slider };
                    case "Coupons":
                        return { type: "coupons", content: item.coupons };
                    case "Full Width Banner":
                        return { type: "fullbanner", content: item.full_width };
                    case "Review Banners":
                        return { type: "review", content: item.review };
                    case "Multiple Banners":
                        return { type: "banners", content: item.banners };
                    default:
                        return null;
                }
            }).filter(Boolean);

            setComponents(mapped);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getData();
    }, []);

    return (
        <div>
            <Header />
            {/* <Section listingType="buy" /> */}

            <div className="homepage">
                {components.map((item, index) => {
                    if (item.type === "banner")
                        return <BannerSection key={index} data={item.content} />;

                    if (item.type === "coupons")
                        return <OffersSection key={index} data={item.content} />;

                    if (item.type === "fullbanner")
                        return <FullWidthBanner key={index} data={item.content} />;
                    
                    if (item.type === "review")
                        return <FeedbackCarousel key={index} data={item.content} />;

                    if (item.type === "banners")
                        return <MultipleBannerSection key={index} data={item.content} />;

                    return null;
                })}
            </div>

            {/* <AdvertiseBanner /> */}
            <Footer />
        </div>
    );
}

export default Home;

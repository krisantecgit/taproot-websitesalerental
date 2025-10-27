import React from "react";
import "./furnituregrid.css";

const furnitureItems = [
    {
        title: "Living Room",
        image:
            "https://assets.furlenco.com/image/upload/dpr_2.0,f_auto,q_auto/v1/plutus/products/0/icon/7009502430%20(1).png",
    },
    {
        title: "Bedroom",
        image:
            "https://assets.furlenco.com/image/upload/dpr_2.0,f_auto,q_auto/v1/plutus/collections/1708662240.png",
    },
    {
        title: "Premium",
        image:
            "https://assets.furlenco.com/image/upload/dpr_2.0,f_auto,q_auto/v1/plutus/products/0/icon/Premium%202.png",
    },
    {
        title: "Storage",
        image:
            "https://assets.furlenco.com/image/upload/dpr_2.0,f_auto,q_auto/v1/s3-furlenco-images/evolve_2_0/storage_icon.png",
    },
    {
        title: "Study",
        image:
            "https://assets.furlenco.com/image/upload/dpr_2.0,f_auto,q_auto/v1/s3-furlenco-images/evolve_2_0/study_icon.png",
    },
    {
        title: "Dining",
        image:
            "https://assets.furlenco.com/image/upload/dpr_2.0,f_auto,q_auto/v1/s3-furlenco-images/evolve_2_0/dining_icon.png",
    },
    {
        title: "Tables",
        image:
            "https://assets.furlenco.com/image/upload/dpr_2.0,f_auto,q_auto/v1/s3-furlenco-images/evolve_2_0/table_icon.png",
    },
    {
        title: "Laungers",
        image:
            "https://assets.furlenco.com/image/upload/dpr_2.0,f_auto,q_auto/v1/s3-furlenco-images/evolve_2_0/chair_icon_v5.png",
    },
    {
        title: "Best Deals",
        image:
            "https://assets.furlenco.com/image/upload/dpr_2.0,f_auto,q_auto/v1/plutus/products/0/icon/Untitled%20design%20(46).png",
    },
    {
        title: "Mattress",
        image:
            "https://assets.furlenco.com/image/upload/dpr_2.0,f_auto,q_auto/v1/plutus/products/0/icon/Matteress%201-1.png",
    },
    {
        title: "Z Rated",
        image:
            "https://assets.furlenco.com/image/upload/dpr_2.0,f_auto,q_auto/v1/plutus/products/0/icon/GenZ%20New.png",
    },
];

const FurnitureGrid = () => {
    return (
        <div className="buypage-container">
            <h2>Buy Furniture</h2>
            <div className="buypage-category">
                {furnitureItems.map((item, index) => (
                    <div key={index} className="card-buy">
                        <img src={item.image} alt={item.title} />
                        <h3>{item.title}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FurnitureGrid;

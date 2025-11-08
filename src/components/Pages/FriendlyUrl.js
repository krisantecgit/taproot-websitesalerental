import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosConfig from "../../Services/axiosConfig";
// import Navigation from "./Navigation";
import Product from "../Products/Product";
import Productdetails from "./Productdetails";
const FriendlyUrlComponent = () => {
  const { friendlyurl, categoryurl, subcategoryurl } = useParams();
  const [data, setData] = useState(null);
  const [type, setType] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFriendlyData = async () => {
      try {
        const res = await axiosConfig.get(`/catlog/seo-url/${friendlyurl}`);
        const result = res.data;
        setData(result);
        setType(result.product_type);
      } catch (err) {
        console.error("Error loading friendly URL", err);
        navigate("/404");
      }
    };
    fetchFriendlyData();
  }, [friendlyurl]);

  if (!data) return <p className="d-flex justify-content-center align-items-center" style={{height : "100vh"}}>Loading content...</p>;

  return (
    <div className="friendly-page-container">
      {type === "product" && (
        <>
          <Productdetails productData={data} />
        </>
      )}

      {type === "category" && (
        <>
          <Product friendlyData ={data} />
        </>
      )}

      {type === "page" && (
        <div className="cms-page">
          <h1>{data.meta_title}</h1>
          <div dangerouslySetInnerHTML={{ __html: data.description }} />
        </div>
      )}

      {!["product", "category", "page"].includes(type) && (
        <p>Unknown content type: {type}</p>
      )}
    </div>
  );
};

export default FriendlyUrlComponent;

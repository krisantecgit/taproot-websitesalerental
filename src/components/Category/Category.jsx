import React, { useEffect, useState } from "react";
import axiosConfig from "../../Services/axiosConfig";
import "./category.css";
import loader from "../Assets/spinner.gif";
import { useNavigate } from "react-router-dom";

const Category = ({ listingType }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  let navigate = useNavigate()
  async function fetchCategories() {
    try {
      const res = await axiosConfig.get(`/catlog/with-${listingType}-or-both/`);
      setCategories(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, [listingType]);
  function handleCategoryClick(slug) {
    navigate(`/${listingType}/${slug}`)
  }
  if (loading) {
    return (
      <div className="loader-container">
        <img src={loader} alt="Loading..." className="loader-gif" />
      </div>
    );
  }

  return (
    <div className="buypage-container">
      <h2>{listingType === "buy" ? "Buy Furniture" : "Rent Furniture"}</h2>
      <div className="buypage-category">
        {
          categories.length > 0 ? (categories.map((item) => (
            <div key={item.id} className="card-buy" onClick={() => handleCategoryClick(item.slug)}>
              <img src={item.image?.image} alt={item.name} />
              <h3>{item.name}</h3>
            </div>
          ))) : <div className="d-flex justify-content-center align-items-center" sty>No Products Found</div>
        }
      </div>
    </div>
  );
};

export default Category;

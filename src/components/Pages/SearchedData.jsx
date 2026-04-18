
import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axiosConfig from "../../Services/axiosConfig";
import loader from "../Assets/spinner.gif";

const Product = React.lazy(() => import("../Products/Product"));

function SearchedData() {
  const [params] = useSearchParams();
  const query = params.get("q");
  const decodedQuery = query?.replace(/-/g, " ");
  const [products, setProducts] = useState([]);
  const [listingType, setListingType] = useState(params.get("listing_type") || "buy");

  useEffect(() => {
    let isActive = true;

    async function fetchSearch() {
      if (!decodedQuery) return;

      const searchQuery = new URLSearchParams({
        listing_type: listingType || "buy",
        search: decodedQuery,
        is_suspended: "false",
        category: params.get("category") || "",
        subcategory: params.get("subcategory") || "",
        price_min: params.get("price_min") || "",
        price_max: params.get("price_max") || "",
        options: params.get("options") || "",
      });

      try {
        const res = await axiosConfig.get(`/catlog/category-variants/?${searchQuery.toString()}`);

        if (isActive) {
          setProducts(res?.data?.results || []);
        }
      } catch (error) {
        console.error("fetchSearch", error);
      }
    }

    fetchSearch();

    return () => {
      isActive = false;
    };
  }, [params, decodedQuery, listingType]);

  function handleListingTypeChange(type) {
    setListingType(type);
  }

  return (
    <div className="search-product-container">
      {/* <h2>Showing results for: {decodedQuery || query}</h2> */}

      <Suspense fallback={<img src={loader} alt="Loading products..." />}>
        <Product products={products}
          searchListingType={listingType}
          onListingTypeChange={handleListingTypeChange} />
      </Suspense>
    </div>
  );
}

export default SearchedData;

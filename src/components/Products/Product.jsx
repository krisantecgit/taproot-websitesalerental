import React, { Suspense, useEffect, useState } from "react";
import Header from "../header/Header";
import "./product.css";
import FilterSection from "../Pages/Filtersection";
import loader from "../Assets/spinner.gif"
import { useLocation } from "react-router-dom";
const ProductSection = React.lazy(() => import("./ProductSection"))

function Product({ friendlyData, products, searchListingType, onListingTypeChange }) {
  const [productData, setProductData] = useState(products || []);
  const location = useLocation()
  const [loading, setLoading] = useState(false);
  const isSearchPage = location.pathname.includes("/search");

  function getCategoryFromUrl() {
    if (location.pathname.startsWith("/rent")) return "rent";
    return "buy";
  }
  const [categoryURL, setCategoryURL] = useState(getCategoryFromUrl())

  useEffect(() => {
    if (products) {
      setProductData(products);
    }
    setCategoryURL(getCategoryFromUrl())
  }, [products]);

  // NEW: This function prevents filters from changing search results
  // const handleProductsChange = (filteredProducts) => {
  //   if (isSearchPage) {
  //     // On search pages, keep original products (ignore filters)
  //     setProductData(products || []);
  //   } else {
  //     // On normal pages, apply filters
  //     setProductData(filteredProducts);
  //   }
  // };
  const handleProductsChange = (filteredProducts) => {
    setProductData(filteredProducts);
  };

  return (
    <>
      <Header />
      <div className="product-container">
        {(friendlyData || products) && (
          <FilterSection
            friendlyData={friendlyData}
            onProductsChange={handleProductsChange} // Use the new function
            onLoading={setLoading}
            categoryurl={categoryURL}
            products={products}
            searchListingType={searchListingType} // Pass current type
            onListingTypeChange={onListingTypeChange} // Pass callback to FilterSection
          />
        )}

        <Suspense fallback={<img src={loader} className="text-align-center" alt="Loading..." />}>
          <ProductSection products={productData} loading={loading} searchListingType={searchListingType} />
        </Suspense>
      </div>
    </>
  );
}

export default Product;
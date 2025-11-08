import React, { Suspense, useEffect, useState } from "react";
import Header from "../header/Header";
import "./product.css";
import FilterSection from "../Pages/Filtersection";
import loader from "../Assets/spinner.gif"
import { useLocation } from "react-router-dom";
const ProductSection = React.lazy(() => import("./ProductSection"))

function Product({ friendlyData, products }) {
  const [productData, setProductData] = useState(products || []);
  const location = useLocation()
  const [loading, setLoading] = useState(false);
  function getCategoryFromUrl() {
    if(location.pathname.startsWith("/rent")) return "rent";
    return "buy";
  }
  const [categoryURL, setCategoryURL] = useState(getCategoryFromUrl())
  useEffect(() => {
    if (products) {
      setProductData(products);
    }
    setCategoryURL(getCategoryFromUrl())
  }, [products]);
  return (
    <>
      <Header />
      <div className="product-container">
        {(friendlyData || products) && (
          <FilterSection
            friendlyData={friendlyData}
            onProductsChange={setProductData}
            onLoading={setLoading}
            categoryurl={categoryURL}
            products={products}
          />
        )}


        <Suspense fallback={<img src={loader} />}>
          <ProductSection products={productData} loading={loading} />
        </Suspense>
      </div>
    </>
  );
}

export default Product;

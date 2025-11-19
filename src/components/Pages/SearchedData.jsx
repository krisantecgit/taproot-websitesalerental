// import React, { Suspense, useEffect, useState } from "react";
// import { useSearchParams } from "react-router-dom";
// import axiosConfig from "../../Services/axiosConfig";
// import loader from "../Assets/spinner.gif";
// import "./search-product.css"
// import ProductSection from "../Products/ProductionSection";

// const Product = React.lazy(() => import("../Products/Product"));

// function SearchedData() {
//   const [params] = useSearchParams();
//   const query = params.get("q");
//   const [products, setProducts] = useState([]);

//   useEffect(() => {
//     async function fetchSearch() {
//       if (!query) return;
//       const res = await axiosConfig.get(
//         `/catlog/category-variants/?listing_type=rent&search=${query}&category_id=&price_min=&price_max=&options=`
//       );
//       setProducts(res?.data?.results || []);
//     }
//     fetchSearch();
//   }, [query]);

//   return (
//     <div className="search-product-container">
//       <h2>Showing results for: {query}</h2>
//       <Suspense fallback={<img src={loader} alt="Loading products..." />}>
//         <ProductSection products={products} />
//       </Suspense>
//     </div>
//   );
// }

// export default SearchedData;



// import React, { Suspense, useEffect, useState } from "react";
// import { useSearchParams } from "react-router-dom";
// import axiosConfig from "../../Services/axiosConfig";
// import loader from "../Assets/spinner.gif";

// const Product = React.lazy(() => import("../Products/Product"));

// function SearchedData() {
//   const [params] = useSearchParams();
//   const query = params.get("q");
//   const collection = params.get("collection");
//   const decodedQuery = query?.replace(/-/g, " ");
//   const [products, setProducts] = useState([]);

//   useEffect(() => {
//     async function fetchSearch() {
//       if (!decodedQuery) return;

//       const res = await axiosConfig.get(
//         `/catlog/category-variants/?listing_type=buy&search=${encodeURIComponent(decodedQuery)}&collection=${encodeURIComponent(collection || "")}&category_id=&price_min=&price_max=&options=`
//       );

//       setProducts(res?.data?.results || []);
//     }
//     fetchSearch();
//   }, [query]);

//   return (
//     <div className="search-product-container">
//       <h2>Showing results for: {query}</h2>

//       <Suspense fallback={<img src={loader} alt="Loading products..." />}>
//         <Product products={products} />
//       </Suspense>
//     </div>
//   );
// }

// export default SearchedData;
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
  const [listingType, setListingType] = useState("rent")

  useEffect(() => {
    async function fetchSearch() {
      if (!decodedQuery) return;
const category = params.get("category") || "";
    const subcategory = params.get("subcategory") || "";
    const price_min = params.get("price_min") || "";
    const price_max = params.get("price_max") || "";
    const options = params.get("options") || "";
      const res = await axiosConfig.get(
        `/catlog/category-variants/?listing_type=${listingType}&search=${encodeURIComponent(decodedQuery)}&category=${category}&subcategory=${subcategory}&price_min=${price_min}&price_max=${price_max}&options=${options}`
      );
      setProducts(res?.data?.results || []);
    }
    fetchSearch();
  }, [query, decodedQuery, listingType]);
  function handleListingTypeChange(type) {
    setListingType(type)
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
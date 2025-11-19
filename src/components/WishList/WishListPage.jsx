import React, { useEffect, useState } from 'react'
import axiosConfig from "../../Services/axiosConfig";
import ProductSection from '../Products/ProductSection';
import Header from '../header/Header';
import "./wishlist.css"
function WishListPage() {
  const [wishListItems, setWishListItems] = useState([]);
  const [loading, setLoading] = useState(false)
  const [listingType, setListingType] = useState("rent")
  const userId = localStorage.getItem("userid")
   async function fetchWishListItem() {
      try {
        setLoading(true)
        const res = await axiosConfig(`/catlog/wishlists/?user=${userId}&type=${listingType}`)
        const transformedData = res?.data?.results?.map(item => ({
          ...item.varient,
          wishlistId: item.id,
          wishlistType: item.type
        })) || [];
        setWishListItems(transformedData)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }
  useEffect(() => {
    fetchWishListItem();
  }, [listingType])
  function handleListingType(type) {
    setListingType(type)
  }
  return (
    <div>
      <Header />
      <div className='wishlist-container'>
        <div className="searched-data">
          <div>
            <span className="search-count">{ wishListItems.length} Items</span>
          </div>
          <div className="listing-type-container">
            <div className={`listing-type ${listingType === "buy" ? "active" : ""}`} onClick={() => handleListingType("buy")}>BUY</div>
            <div className={`listing-type ${listingType === "rent" ? "active" : ""}`} onClick={() => handleListingType("rent")}>RENT</div>
          </div>
        </div>
        <ProductSection products={wishListItems} loading={loading} listingType={listingType} onRefresh={fetchWishListItem} />
      </div>
    </div>
  )
}

export default WishListPage
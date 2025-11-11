import "./header.css"
import logo from "../Assets/taproot.png"
import { LuCircleCheck, LuClock3 } from 'react-icons/lu'
import { IoChevronDownOutline, IoLocationOutline } from 'react-icons/io5'
import { FiSearch, FiUser, FiHeart, FiShoppingCart } from "react-icons/fi"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import useDebouncedValue from "../../utils/Debounce"
import axiosConfig from "../../Services/axiosConfig"
import { useSelector } from "react-redux"

function Header() {
  const searchRef = useRef(null)
  let navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("query");
  const [query, setQuery] = useState(search);
  const [products, setProducts] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedSearchTerm = useDebouncedValue(query, 500)
  const location = useLocation()
  const [path, setPath] = useState("")
     function getUrl() {
      if(location.pathname.startsWith("/buy")) return "buy"
      if(location.pathname.startsWith("/rent")) return "rent"
    }
    const {buyCart, rentCart} = useSelector(state => state.cart)
  useEffect(() => {
    // if (!query) setShowSuggestions(false);
    if (!debouncedSearchTerm) return;
    async function fetchSearchResult() {
      try {
        const res = await axiosConfig.get(`/catlog/search-keywords/?search=${debouncedSearchTerm}`)
        setProducts(res?.data?.suggestions)
      } catch (error) {
        console.log(error)
        setProducts([]);
      }
    }
    fetchSearchResult()
    setPath(getUrl())
  }, [debouncedSearchTerm, query])
  useEffect(() => {
  setPath(getUrl());
}, [location]);
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSearchClick = () => {
    setShowSuggestions(true)
  }


  const handleSearchSubmit = (searchValue = query) => {
  const valueToSearch = searchValue || query;
  if (valueToSearch) {
    navigate(`/search/results?q=${encodeURIComponent(valueToSearch)}`);
    setShowSuggestions(false);
    setQuery(valueToSearch)
  }
};


  return (
    <div className="header">
      {/* Left Content */}
      <div className="left-content">
        <div className="logo" onClick={() => navigate("/")}>
          <img src={logo} alt="logo" />
        </div>

        <div className="location">
          <IoLocationOutline className="icon" />
          <div>
            <span className="label">Delivery to</span><br />
            <span className="pincode">560001</span>
          </div>
        </div>

        <div className={`menu-item ${path === "buy" ? "active" : ""}`} onClick={() => navigate("/buy")}>
          <LuCircleCheck className="icon" />
          <span>Buy</span>
          <IoChevronDownOutline className="chevron" />
        </div>

        <div className={`menu-item ${path === "rent" ? "active" : ""}`} onClick={() => navigate("/rent")}>
          <LuClock3 className="icon" />
          <span>Rent</span>
          <IoChevronDownOutline className="chevron" />
        </div>
        {/* 
        <div className="menu-item unlmtd">
          <span>UNLMTD</span>
        </div> */}
      </div>
      {/* Right Content */}
      <div className="right-content">
        <div className="search-container" ref={searchRef}>
          <div className={`search-bar ${products.length > 0 && showSuggestions ? 'search-bar-expanded' : ''}`}>
            <input
              type="text"
              value={query || ""}
              placeholder="What are you searching for?"
              // onChange={handleSearch}
              onChange={(e) => setQuery(e.target.value)}
              onClick={handleSearchClick}
              onKeyUp={(e) => { if (e.key === "Enter") handleSearchSubmit() }}
            />
            <FiSearch className="search-icon" onClick={() => handleSearchSubmit()} />
          </div>

          {showSuggestions && products.length > 0 && (
            <div className="suggestions-box">
              <div className="suggestions-list">
                {products.map((item, index) => (
                  <div key={index} className="suggestion-item" onClick={() => handleSearchSubmit(item)}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="user-box">
          <FiUser className="icon" />
          <div className="user-modal">
            <div>Hello!sairam</div>
            <div>Contact Us</div>
            <div>Track Product Issue Request</div>
            <div>Find Store</div>
            <div>Wishlist</div>
            <div>Refunds</div>
            <div>Help Centre</div>
            <div>Logout</div>
          </div>
        </div>
        <FiHeart className="icon" />
        <div className="cart" onClick={() => navigate("/cart")}>
          <FiShoppingCart className="icon" />
          {(buyCart.length) + (rentCart.length) > 0 && <span className="cart-count">{(buyCart.length) + (rentCart.length)}</span>}
          
        </div>
      </div>
    </div>
  )
}

export default Header

import "./header.css"
import logo from "../Assets/taproot.png"
import { LuCircleCheck, LuClock3 } from 'react-icons/lu'
import { IoChevronDownOutline, IoLocationOutline } from 'react-icons/io5'
import { FiSearch, FiUser, FiHeart, FiShoppingCart } from "react-icons/fi"
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import useDebouncedValue from "../../utils/Debounce"
import axiosConfig from "../../Services/axiosConfig"
import { useSelector } from "react-redux"
import LoginModal from "../Login/Login"
import { toast } from "react-toastify"

function Header() {
  const searchRef = useRef(null)
  let navigate = useNavigate();
  const [loginModal, setLoginModal] = useState(false)
  const [userId, setUserId] = useState(localStorage.getItem("userid"))
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState(localStorage.getItem("name"))
  const search = searchParams.get("query");
  const [query, setQuery] = useState(search);
  const [products, setProducts] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedSearchTerm = useDebouncedValue(query, 1000)

  const [currentLocation, setCurrentLocation] = useState(
    localStorage.getItem("userLocation") || "Detect location"
  );

  const location = useLocation()
  const [path, setPath] = useState("")
  function getUrl() {
    if (location.pathname.includes("/buy/product/")) return "";
    if (location.pathname.includes("/rent/product/")) return "";
    if (location.pathname.startsWith("/buy")) return "buy"
    if (location.pathname.startsWith("/rent")) return "rent"
  }
  const { buyCart, rentCart } = useSelector(state => state.cart)
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

  const API_KEY = "AIzaSyDD8frd15FoMhemosVqGvVBCHaRjLgNszc";

  const detectLocation = (showToast = false) => {
    if (!navigator.geolocation) {
      if (showToast) toast.error("Geolocation is not supported by your browser");
      return;
    }
  
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
  
        if (!window.google?.maps) {
          if (showToast) toast.error("Maps failed to load.");
          return;
        }

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode(
          { location: { lat: latitude, lng: longitude } },
          (results, status) => {
            if (status === "OK" && results[0]) {
              const addressComponents = results[0].address_components;
              let shortName = results[0].formatted_address.split(",")[0];
              
              const locality = addressComponents.find(c => c.types.includes("locality"));
              const sublocality = addressComponents.find(c => c.types.includes("sublocality") || c.types.includes("sublocality_level_1") || c.types.includes("neighborhood"));
              
              if (sublocality) {
                shortName = sublocality.short_name || sublocality.long_name;
              } else if (locality) {
                shortName = locality.short_name || locality.long_name;
              }
              
              setCurrentLocation(shortName);
              localStorage.setItem("userLocation", shortName);
              if (showToast) toast.success("Location successfully detected!");
            }
          }
        );
      },
      (error) => {
        console.warn("Geolocation permission denied or error:", error.message);
        if (error.code === error.PERMISSION_DENIED) {
           toast.warn("Location permission denied. Please enable it in your browser settings to detect your location.");
        } else if (showToast) {
           toast.error(`Unable to retrieve your location: ${error.message}`);
        }
      }
    );
  };

  useEffect(() => {
    // Only detect automatically if no saved location is present
    const loadGoogleAndDetect = () => {
      const savedLocation = localStorage.getItem("userLocation");
      if (!savedLocation) {
        detectLocation();
      }
    };

    if (window.google) {
      loadGoogleAndDetect();
      return;
    }
  
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => {
      loadGoogleAndDetect();
    };
  
    document.head.appendChild(script);
  }, []); // Run on mount only (empty array = not on every render)

  

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
  const handleLoginSuccess = (userId) => {
    setUserId(userId);
    setUser(localStorage.getItem("name"));
    setLoginModal(false);
  }
  function HandleWishlist() {
    if(userId) {
      navigate("/my/wishlist")
    } else {
      setLoginModal(true)
    }
  }
  return (
    <div className="header">
      {/* Left Content */}
      <div className="left-content">
        <div className="logo" onClick={() => navigate("/")}>
          <img src={logo} alt="logo" />
        </div>

        <div className="location" onClick={() => detectLocation(true)}>
          <IoLocationOutline className="icon" />
          <div className="location-content">
            <span className="label">Delivery to</span>
            <span className="detect-location" title={currentLocation || "Detect Location"}>
              {currentLocation || "Detect Location"}
            </span>
          </div>
        </div>

        <div className={`menu-item ${path === "buy" ? "active" : ""}`} onClick={() => navigate("/buy")}>
          <LuCircleCheck className="icon" />
          <span>Sale</span>
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
            {
              !userId ? <div>Hello! User</div> : <div>Hello! {user}</div>
            }
            {
              !userId ? "" : (
                <>
                  <div><Link to="/account/orders">My Orders</Link></div>
                  <div><Link to="/account/addresses">My Address</Link></div>
                  <div><Link to="/my/wishlist">Wishlist</Link></div>
                </>
              )
            }
            <div>
              {
                !userId ? <Link onClick={() => setLoginModal(true)}>Login</Link> : <Link to="/logout">Logout</Link>
              }
            </div>
          </div>
        </div>
        <FiHeart className="icon" onClick={HandleWishlist} />
        <div className="cart" onClick={() => navigate("/cart")}>
          <FiShoppingCart className="icon" />
          {(buyCart.length) + (rentCart.length) > 0 && <span className="cart-count">{(buyCart.length) + (rentCart.length)}</span>}

        </div>
      </div>
      <LoginModal show={loginModal} onHide={() => setLoginModal(false)} onLoginSuccess={handleLoginSuccess} />
    </div>
  )
}

export default Header

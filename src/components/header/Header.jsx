import "./header.css"
// import logo from "../Assets/logo.avif"
import logo from "../Assets/taproot.png"
import { CiLocationOn } from 'react-icons/ci'
import { LuCircleCheck, LuClock3 } from 'react-icons/lu'
import { IoChevronDownOutline, IoLocateOutline, IoLocationOutline } from 'react-icons/io5'
import { FiSearch, FiUser, FiHeart, FiShoppingCart } from "react-icons/fi"
import { useNavigate } from "react-router-dom"

function Header() {
  let navigate = useNavigate()
  return (
    <div className="header">
      {/* Left Content */}
      <div className="left-content">
        <div className="logo" onClick={()=>navigate("/")}>
          <img src={logo} alt="logo" />
        </div>

        <div className="location">
          <IoLocationOutline className="icon" />
          <div>
            <span className="label">Delivery to</span><br />
            <span className="pincode">560001</span>
          </div>
        </div>

        <div className="menu-item" onClick={() => navigate("/buy")}>
          <LuCircleCheck className="icon" />
          <span>Buy</span>
          <IoChevronDownOutline className="chevron" />
        </div>

        <div className="menu-item" onClick={() => navigate("/rent")}>
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
        <div className="search-bar">
          <input type="text" placeholder="What are you searching for?" />
          <FiSearch className="search-icon" />
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
        <div className="cart">
          <FiShoppingCart className="icon" />
          <span className="cart-count">1</span>
        </div>
      </div>
    </div>
  )
}

export default Header

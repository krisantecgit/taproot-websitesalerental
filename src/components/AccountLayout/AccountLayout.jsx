import React, { useEffect, useState } from "react";
import Header from "../header/Header";
import "./accountlayout.css";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

function AccountLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1020);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1020;
      setIsMobile(mobile);

      // ✅ KEY FIX:
      // if screen becomes big, leave menu page
      if (!mobile && location.pathname.includes("/account/menu")) {
        navigate(-1, { replace: true });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [location.pathname, navigate]);

  return (
    <div>
      <Header />

      <div className="account-layout">
        {/* Back button → ONLY mobile */}
        {isMobile && (
          <button
            className="mobile-back-btn"
            onClick={() => navigate("/account/menu")}
          >
            Back
          </button>
        )}

        {/* Sidebar → always desktop */}
        {!isMobile && (
          <div className="sidebar">
            <div className="account-title">
              <p>Account</p>
              <p>{localStorage.getItem("name")}</p>
            </div>
            <div><Link to="orders">Orders</Link></div>
            <div><Link to="addresses">Address</Link></div>
            <div><Link to="/my/wishlist">Wishlist</Link></div>
            <div><Link to="/logout">Logout</Link></div>
          </div>
        )}

        {/* Content */}
        <div className="account-outlet">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AccountLayout;

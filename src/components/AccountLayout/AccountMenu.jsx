import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./accountlayout.css";

function AccountMenu() {
    const navigate = useNavigate();

    return (
        <div className="mobile-sidebar-page">
            {/* <button className="back-btn" onClick={() => navigate(-1)}>
        Back
      </button> */}
            <div className="sidebar">
                <div className="account-title">
                    <p>Account</p>
                    <p>{localStorage.getItem("name")}</p>
                </div>

                <div><Link to="/account/orders">Orders</Link></div>
                <div><Link to="/account/addresses">Address</Link></div>
                <div><Link to="/my/wishlist">Wishlist</Link></div>
                <div><Link to="/logout">Logout</Link></div>
            </div>
        </div>
    );
}

export default AccountMenu;

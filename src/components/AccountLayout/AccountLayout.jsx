import React from 'react'
import Header from '../header/Header'
import "./accountlayout.css"
import { Link, Outlet } from 'react-router-dom'
function AccountLayout() {
    return (
        <div>
            <Header />
            <div className='account-layout'>
                <div className="sidebar">
                    <div className='account-title'>
                        <p>Account</p>
                        <p>Sairam</p>
                    </div>
                    <div><Link to="/account/orders">Orders</Link></div>
                    <div>Address</div>
                    <div>Wishlist</div>
                    <div><Link to="/logout">Logout</Link></div>
                </div>
                 <div className='account-outlet'>
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default AccountLayout
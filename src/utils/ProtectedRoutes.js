import React from 'react'
import {Navigate,Outlet, useLocation} from "react-router-dom"

const ProtectedRoute = () => {
    let location = useLocation();

    return localStorage.getItem('token') 
    ? <Outlet />
    : <Navigate to="/" replace state={{ from: location }} />;

};

export default ProtectedRoute;
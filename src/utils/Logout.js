import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearWishLists } from "../redux/cartSlice";

const Logout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userid");
    localStorage.removeItem("selectedAddressData")
    localStorage.removeItem("wishlistItems")
    localStorage.setItem("showLoginModal", "true");
    dispatch(clearWishLists())
    navigate("/", { replace: true });
  }, [navigate]);

  return null;
};

export default Logout;

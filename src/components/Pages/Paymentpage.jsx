import React, { useEffect, useState } from "react";
import "./payment.css";
import { HiOutlineCurrencyDollar } from "react-icons/hi";
import { FaRegCreditCard } from "react-icons/fa";
import { TbBuildingBank } from "react-icons/tb";
import { PiMoneyLight } from "react-icons/pi";
import CheckoutNavbar from "../CheckoutNavbar/CheckoutNavbar";
import axiosConfig from "../../Services/axiosConfig"
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearBuyCart, clearRentCart } from "../../redux/cartSlice";
function Payment() {
  const [active, setActive] = useState("cash");
  const [orderDetails, setOrderDetails] = useState();
  // const {clearRentCart, clearBuyCart} = useSelector((store)=> store.cart)
  const dispatch = useDispatch()
  const orderId = localStorage.getItem("orderId")
  let navigate = useNavigate();
  useEffect(()=>{
    async function fetchOrderDetails() {
      try {
        const res = await axiosConfig.get(`/accounts/orders/${orderId}/`)
        setOrderDetails(res?.data)
      } catch (error) {
        console.log(error)
      }
    }
    fetchOrderDetails()
  }, [])
  async function PlaceOrderByCOD() {
    const payload = {
      orderstatus : "Placed",
      payment_mode:"cash"
    }
    try {
      const res = await axiosConfig.post(`/accounts/orders/${orderId}/order_status_update/`, payload)
        toast.success(res.data.message)
        localStorage.removeItem("orderId")
        localStorage.removeItem("buyCart")
        localStorage.removeItem("rentCart")
        localStorage.removeItem("saleAddress")
        localStorage.removeItem("rentalAddress")
        dispatch(clearBuyCart())
        dispatch(clearRentCart())
        navigate("/account/orders")
    } catch (error) {
      console.log(error)
    }
  }
  const formatPrice = (price) =>
        price?.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).replace("$", "$ ");
  return (
    <div>
      <CheckoutNavbar />
      <div className="payment-container">
      <div className="amount-header">
        <div className="amout-total-h">
          <p><HiOutlineCurrencyDollar /></p>
          <p className="amount-title">Total amount payable now</p>
          <p className="amount-saved">You have saved ₹36,267.00 on this order</p>
        </div>
        <div className="total-payment">{formatPrice(orderDetails?.total_amount)}</div>
      </div>

      <div className="payment-section">
        <h3>Payment Options</h3>

        <div className="payment-box">
          {/* Left Menu */}
          <div className="payment-left">
            <div
              className={`pay-option ${active === "cash" ? "active" : ""}`}
              onClick={() => setActive("cash")}
            >
              <i>💸</i> Cash
            </div>
            <div
              className={`disabled pay-option ${active === "online" ? "active" : ""}`}
              onClick={() => setActive("online")}
            >
              <FaRegCreditCard /> Online Payment
            </div>
            {/* <div
              className={`pay-option ${active === "bank" ? "active" : ""}`}
              onClick={() => setActive("bank")}
            >
              <TbBuildingBank /> Net Banking
            </div>
            <div
              className={`pay-option ${active === "emi" ? "active" : ""}`}
              onClick={() => setActive("emi")}
            >
              <PiMoneyLight /> No Cost EMI
            </div> */}
          </div>

          {/* Right Panel */}
          <div className="payment-right">
            {active === "cash" && (
              <div className="upi-box">
                <button onClick={PlaceOrderByCOD}><span>PLACE ORDER</span> <span>{formatPrice(orderDetails?.total_amount)}</span></button>
              </div>
            )}
            {active === "online" && (
              <div className="upi-box">
                <input type="text" placeholder="Enter Card Number" />
                <button>PAY NOW <span>{formatPrice(orderDetails?.total_amount)}</span></button>
              </div>
            )}
            {/* {active === "bank" && (
              <div className="upi-box">
                <input type="text" placeholder="Enter Bank Account or User ID" />
                <button>PAY NOW ₹17,724.71</button>
              </div>
            )}
            {active === "emi" && (
              <div className="upi-box">
                <input type="text" placeholder="Enter EMI Details" />
                <button>PAY NOW ₹17,724.71</button>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default Payment;

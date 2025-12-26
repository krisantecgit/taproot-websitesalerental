import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import axiosConfig from "../../Services/axiosConfig"
import bag from "../Assets/bag.png"
import tick from "../Assets/tick.png"
import orderImg from "../Assets/orderimg.png"
import "./order.css"
function Orders() {
  const [order, setOrder] = useState([])
  const [loading, setLoading] = useState(false)
  const [btnActive, setBtnActive] = useState("all")
  const [orderType, setOrderType] = useState("")
  useEffect(() => {
    async function fetchOrders() {
      setLoading(true)
      try {
        const res = await axiosConfig(`/accounts/orders/?page=1&user=${localStorage.getItem("userid")}&order_type=${orderType}`)
        setOrder(res?.data?.results)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [orderType])
  const timeString = (dateString) => {
    const date = new Date(dateString);
    const options = {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };
    return date.toLocaleDateString('en-US', options);
  };
  function handleType(type) {
    setBtnActive(type)
    if (type === "all") setOrderType("")
    if (type === "sale") setOrderType("sale")
    if (type === "rental") setOrderType("rental")
    if (type === "both") setOrderType("both")
  }
  return (
    <div>
      <div className="order-overflow" >
        <div className='order-btn'>
          <button onClick={() => handleType("all")} className={`${btnActive === "all" ? "active" : ""}`}>All</button>
          <button onClick={() => handleType("sale")} className={`${btnActive === "sale" ? "active" : ""}`}>Sale</button>
          <button onClick={() => handleType("rental")} className={`${btnActive === "rental" ? "active" : ""}`}>Rental</button>
          <button onClick={() => handleType("both")} className={`${btnActive === "both" ? "active" : ""}`}>Both</button>
        </div>
        {loading ? (
          <div className="loader-container">
            <img src={require("../Assets/spinner.gif")} alt="loading" />
          </div>
        )
          : (order.length > 0 ?
            (order.map((order) => (
              order.orderstatus !== "Cart" && (
                <div key={order.id}>
                  <div className="row order">
                    <div className="order-container">
                      <div className="order-data">
                        {order.orderstatus === "Cart" && <img src={bag} className="image" alt="bag" />}
                        {order.orderstatus === "Placed" && <img src={tick} className="image" alt="tick" />}
                        {order.orderstatus !== "Cart" && order.orderstatus !== "Placed" &&
                          <img src={orderImg} alt="" className="image" />
                        }
                        <div>
                          <h5 className="order_id">Order Id:{order?.id}&nbsp;-&nbsp;${order.net_amount}</h5>
                          <p className="">Placed on {timeString(order.order_date)}</p>
                        </div>
                        <div className={`status_badge ${order.orderstatus === "Cart" || order.orderstatus === "Placed" ? "green" : "grey"}`}>
                          <div>{order.orderstatus}</div>
                        </div>
                      </div>
                      {(
                        // <NavLink to={`${order.id}/${order?.address_id}`}>
                        //   <button type="button" className="order-view-button">view details</button>
                        // </NavLink>
                        <NavLink
                          to={`/account/orders/order-details?orderID=${order.id}&type=${order.order_type}${order.order_type === "rental"
                              ? `&rental_id=${order.rental_order_id}`
                              : ""
                            }&address=${order.address_id}`}
                        >
                          <button className="order-view-button">view details</button>
                        </NavLink>
                      )}
                    </div>
                  </div>
                  <hr />
                </div>
              )
            )))
            : (<p className="no-orders">You have not ordered anything yet!!!</p>)
          )
        }
      </div>
    </div>
  )
}

export default Orders
import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import axiosConfig from "../../Services/axiosConfig"
import  bag from "../Assets/bag.png"
import tick from "../Assets/tick.png"
import orderImg from "../Assets/orderimg.png"
import "./order.css"
function Orders() {
    const [order, setOrder] = useState([])
    const [loading, setLoading] = useState(false)
    useEffect(()=>{
        async function fetchOrders() {
            setLoading(true)
            try {
                const res = await axiosConfig(`/accounts/orders/?page=1&user=${localStorage.getItem("userid")}`)
                setOrder(res?.data?.results)
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false)
            }
        }
        fetchOrders()
    },[])
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
  console.log(order)
    return (
        <div>
           <div className="order-overflow" >
                {/* <div className="sticky-container">
                  <div className="order-history">
                    <span>Ordered products history</span>
                  </div>
                </div> */}
                {loading ? (
                  <div className="loader-container">
                    <img src={require("../Assets/spinner.gif")} alt="loading" />
                  </div>
                )
                  : (order.length > 0 ?
                    (order.map((order, index) => (
                      order.orderstatus !== "Cart" && (
                        <div>
                          <div className="row order" key={index}>
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
                                <NavLink to={`${order.id}/${order?.addresses?.id}`}>
                                  <button type="button" disabled={true} className="order-view-button">view details</button>
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
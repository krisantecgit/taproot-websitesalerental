import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import axiosConfig from "../../Services/axiosConfig";
import "./orderdetails.css"
import { TbTruckDelivery } from 'react-icons/tb';

function OrderDetails() {
    let [searchParams] = useSearchParams();
    let navigate = useNavigate();
    const [orderData, setOrderData] = useState([]);
    const [addressData, setAddressdata] = useState()
    const [lodaing, setLoading] = useState(false)
    const orderId = searchParams.get("orderID");
    const type = searchParams.get("type");
    const rentalId = searchParams.get("rental_id");
    const addressId = searchParams.get("address");
    const formatPrice = (price) =>
        price?.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            // minimumFractionDigits: 0,
            // maximumFractionDigits: 0,
        }).replace("$", "$ ");
    async function fetchAddress() {
        try {
            const response = await axiosConfig(`/accounts/address/${addressId}`)
            setAddressdata(response.data)
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        if (!orderId || !type) {
            navigate("/account/orders");
            return;
        }
        async function fetchOrderData() {
            setLoading(true)
            try {
                const rentalParam =
                    type === "rental" ? `&rental_order_id=${rentalId || ""}` : "";

                const res = await axiosConfig(`/accounts/orderdetails/?order=${orderId}&item_type=${type}${rentalParam}`)
                setOrderData(res?.data.results)
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false)
            }
        }
        fetchOrderData()
        fetchAddress()
    }, [rentalId, type, orderId, navigate])
    const rentalItems = orderData.filter(item => item.item_type === "rental");
    const saleItems = orderData.filter(item => item.item_type === "sale");

    return (
        <>
            {
                lodaing ? <div className='spinner-container'><img src={require("../Assets/spinner.gif")} alt='loading' /></div> :
                    (
                        <div>
                            <div className="order-details-wrapper">
                                <div className='d-flex justify-content-between'>
                                    <h4>{orderData.length} item{orderData.length > 1 ? "s" : ""}</h4>
                                    <h4>Order Id: {orderData[0]?.id}</h4>
                                </div>
                                {orderData.map((item) => (
                                    <div className="order-item" key={item.id}>
                                        <div className="left">
                                            <img
                                                src={item?.varient?.images[0]?.image.image || "/placeholder.png"}
                                                alt="product"
                                            />

                                            <div className="info">
                                                <div className="name">{item.varient?.name}</div>
                                                <div className="qty">
                                                    ${item.offer_price} × {item.quantity}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="right">
                                            <div className="price">${item.total_price}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="price-breakup-section">
                                {rentalItems.length > 0 && (
                                    <div className="breakup-background2">
                                        <div className="break-header">
                                            <h4>Rent Cost Breakup</h4>
                                        </div>

                                        <div className="data-container-parent">
                                            {rentalItems.map((item) => {
                                                const basePrice = Number(item.varient.prices.rental_price);
                                                const qty = Number(item.quantity);
                                                const duration = Number(item.rental_duration);
                                                const price = Number(item.price);
                                                const offer = Number(item.offer_price);

                                                return (
                                                    <div className="data-container" key={item.id}>
                                                        <div className="break-item-title">
                                                            {item.varient.name} × {qty}
                                                        </div>

                                                        <div className="breakup-item">
                                                            <div>(A) Base Rental Cost</div>
                                                            <div>
                                                                {formatPrice(basePrice)}/
                                                                {item.package === "Monthly"
                                                                    ? "Month"
                                                                    : item.package === "Daily"
                                                                        ? "Day"
                                                                        : "Week"}
                                                            </div>
                                                        </div>

                                                        <div className="breakup-item">
                                                            <div>(B) Duration</div>
                                                            <div>
                                                                {duration}{" "}
                                                                {item.package === "Monthly"
                                                                    ? "Months"
                                                                    : item.package === "Daily"
                                                                        ? "Days"
                                                                        : "Weeks"}
                                                            </div>
                                                        </div>

                                                        <div className="breakup-item">
                                                            <div>(C) Quantity</div>
                                                            <div>{qty} Qty</div>
                                                        </div>

                                                        <div className="breakup-item">
                                                            <div>(D) Total Price (A × B × C)</div>
                                                            <div>{formatPrice(basePrice * duration * qty)}</div>
                                                        </div>

                                                        <div className="breakup-item text-success">
                                                            <div>(E) Rental Discount</div>
                                                            <div>
                                                                -{Math.round(Number(item.discount_percentage))}%{" "}
                                                                -{formatPrice(price * qty - offer * qty)}
                                                            </div>
                                                        </div>

                                                        <div className="breakup-item">
                                                            <div>Net Amount</div>
                                                            <div>{formatPrice(offer * qty)}</div>
                                                        </div>

                                                        <div className="discount-green">
                                                            You Will Save {formatPrice(price * qty - offer * qty)}
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            <div className="breakup-item">
                                                <div>Rental Total</div>
                                                <div>${formatPrice(orderData[0]?.total_price)}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {saleItems.length > 0 && (
                                    <div className="breakup-background2">
                                        <div className="break-header">
                                            <h4>Buy Cost Breakup</h4>
                                        </div>

                                        <div className="data-container-parent">
                                            {saleItems.map((item) => {
                                                const price = Number(item.price);
                                                const offer = Number(item.offer_price);
                                                const qty = Number(item.quantity);

                                                return (
                                                    <div className="data-container" key={item.id}>
                                                        <div className="break-item-title">
                                                            {item.varient.name} × {qty}
                                                        </div>

                                                        <div className="breakup-item">
                                                            <div>(A) Base Sale Cost</div>
                                                            <div>{formatPrice(price)}</div>
                                                        </div>

                                                        <div className="breakup-item">
                                                            <div>(B) Quantity</div>
                                                            <div>{qty} Qty</div>
                                                        </div>

                                                        <div className="breakup-item">
                                                            <div>(C) Total Price (A × B)</div>
                                                            <div>{formatPrice(price * qty)}</div>
                                                        </div>

                                                        <div className="breakup-item text-success">
                                                            <div>(D) Sale Discount</div>
                                                            <div>
                                                                -{Math.round(((price - offer) / price) * 100)}%{" "}
                                                                -{formatPrice(price * qty - offer * qty)}
                                                            </div>
                                                        </div>

                                                        <div className="breakup-item">
                                                            <div>(E) Net Price</div>
                                                            <div>{formatPrice(offer * qty)}</div>
                                                        </div>

                                                        <div className="discount-green">
                                                            You Will Save {formatPrice(price * qty - offer * qty)}
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            <div className="breakup-item">
                                                <div>Sale Total</div>
                                                <div>{formatPrice(Number(orderData[0]?.order?.sale_total_amount))}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>
                            {addressData && (
                                <div className="delivery-address-card">
                                    <div className="delivery-header">
                                        <span className="address-icon"><TbTruckDelivery /></span>
                                        <span className="delivery-title">Delivery Address</span>
                                    </div>

                                    <div className="delivery-body">
                                        <div className="address-row">
                                            <span className="label">Name:</span>
                                            <span className="value">{addressData.name}</span>
                                        </div>

                                        <div className="address-row">
                                            <span className="label">Phone number:</span>
                                            <span className="value">{addressData.mobileno}</span>
                                        </div>

                                        <div className="address-row">
                                            <span className="label">Address:</span>
                                            <span className="value">
                                                {addressData.flat_no}, {addressData.address_line_1},{" "}
                                                {addressData.address_line_2}, {addressData.city},{" "}
                                                {addressData.state} {addressData.zipcode},{" "}
                                                {addressData.country}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                    )
            }

        </>
    )
}

export default OrderDetails
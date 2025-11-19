import React, { useEffect, useState } from 'react'
import { TbTruckDelivery } from 'react-icons/tb'
import { FaArrowRight, FaRegClock } from 'react-icons/fa6'
import Header from '../header/Header'
import "../CartPage/cartpage.css"
import { useDispatch, useSelector } from 'react-redux'
import { FiTrash2 } from 'react-icons/fi'
import { addToBuyCart, addToRentCart, decreaseBuyQty, decreaseRentQty, removeFromBuyCart, removeFromRentCart } from '../../redux/cartSlice'
import { useNavigate } from 'react-router-dom'
import { BiCheckCircle, BiChevronDown } from 'react-icons/bi'
import axiosConfig from "../../Services/axiosConfig"
import { IoArrowForward } from 'react-icons/io5'
import LoginModal from '../Login/Login'
import { toast } from 'react-toastify'
import MonthOffcanvas from '../CartPage/MonthCanva'
import CheckoutNavbar from '../CheckoutNavbar/CheckoutNavbar'

function Checkout() {
    const { buyCart, rentCart } = useSelector(store => store.cart)
    const [showMonth, setShowMonth] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [deliveryType, setDeliveryType] = useState("company-transport")
    const [rentalData, setRentalData] = useState([])
    const [loginModal, setLoginModal] = useState(false)
    const [userId, setUserId] = useState(localStorage.getItem("userid"))
    const [orderData, setOrderData] = useState([])
    const [priceBreakup, setPriceBreakup] = useState(null)
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch();
    let navigate = useNavigate()
    useEffect(() => {

        async function fetchExistingOrderData() {
            setLoading(true)
            try {
                const res = await axiosConfig(`/accounts/orderdetails/?order=${localStorage.getItem("orderId")}`)
                setOrderData(res?.data?.results)
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false)
            }
        }
        fetchExistingOrderData()

    }, [])
    useEffect(() => {
        if (!loading) {
            const hasExistingOrder = orderData.length > 0;
            const hasCartItems = buyCart.length > 0 || rentCart.length > 0;

            if (!hasExistingOrder && !hasCartItems) {
                navigate("/cart");
            }
        }
    }, [loading, orderData, buyCart, rentCart, navigate]);

    const formatPrice = (price) => {
        if (!price && price !== 0) return "$ 0";

        const formatted = new Intl.NumberFormat('en-US').format(price);
        return `$ ${formatted}`;
    };
    useEffect(() => {
        const totalBuyQty = buyCart.reduce((total, item) => total + (item?.qty || 0), 0);
        const totalRentQty = rentCart.reduce((total, item) => total + (item?.qty || 0), 0);

        const payload = {
            items: [
                ...(buyCart.length > 0 ? [{
                    cart_type: "buy",
                    quantity: totalBuyQty,
                    sale_address_id: saleAddress?.id
                }] : []),
                ...(rentCart.length > 0 ? [{
                    cart_type: "rent",
                    quantity: totalRentQty,
                    rental_address_id: rentalAddress?.id
                }] : [])
            ]
        }

        async function postPpriceBreakup() {
            try {
                const res = await axiosConfig.post(`/accounts/deliverycharges/`, payload)
                setPriceBreakup(res?.data?.details)
                console.log(res)
            } catch (error) {
                console.log(error)
            }
        }
        postPpriceBreakup()
    }, [])
    console.log(priceBreakup, "ppppp")
    useEffect(() => {
        if (rentCart.length === 0) return;
        const data = rentCart?.map((ele) => ({
            variant_id: ele.id,
            quantity: ele.qty,
            from_date: ele.fromDate,
            to_date: ele.toDate
        }));
        const payload = { variants: data };

        async function getRentalData() {
            try {
                const res = await axiosConfig.post("/accounts/rental_charges/", payload);
                setRentalData(res?.data?.results || []);
            } catch (error) {
                console.log(error);
            }
        }

        getRentalData();
    }, [rentCart]);
    useEffect(() => {
        const id = localStorage.getItem("userid")
        setUserId(id)
    }, [])
    const handleLoginSuccess = (userId) => {
        setUserId(userId);
        setLoginModal(false);
    }
    const saleAddress = localStorage.getItem("saleAddress") ? JSON.parse(localStorage.getItem("saleAddress")) : null
    const rentalAddress = localStorage.getItem("rentalAddress") ? JSON.parse(localStorage.getItem("rentalAddress")) : null
    async function proceedToCheckout() {
        if (!saleAddress && buyCart.length > 0) {
            toast.error("Please select sale delivery address");
            navigate('/address', { state: { addressType: 'sale' } });
            return;
        }

        if (!rentalAddress && rentCart.length > 0) {
            toast.error("Please select rental delivery address");
            navigate('/address', { state: { addressType: 'rental' } });
            return;
        }
        const buyAddressId = buyCart.length > 0 ? saleAddress?.id : ""
        const rentAddressId = rentCart.length > 0 ? rentalAddress?.id : ""
        const payload = {
            sale_addresses: buyAddressId,
            rental_addresses: rentAddressId,
            order_details: [
                ...buyCart?.map((ele) => ({
                    variant: ele.id,
                    item_type: ele.type,
                    quantity: ele.qty
                })),
                ...rentCart?.map((ele) => ({
                    variant: ele.id,
                    quantity: ele.qty,
                    item_type: ele.type,
                    rental_start_date: ele.fromDate,
                    rental_end_date: ele.toDate,
                }))
            ]
        }
        try {
            const oredrId = localStorage.getItem("orderId");
            if (oredrId) {
                const res = await axiosConfig.patch(`/accounts/orders/${oredrId}/`, payload);
                navigate('/payment');
            } else {
                const res = await axiosConfig.post(`/accounts/orders/`, payload);
                localStorage.setItem("orderId", res?.data?.id)
                if (res.data.success) {
                    navigate('/payment');
                }
            }
        } catch (error) {
            console.log(error)
        }
    }
    async function handleRentQtyUpdate(item, type) {
        try {
            const variantId = item?.varient?.id ?? item?.id;

            const rentCart = JSON.parse(localStorage.getItem("rentCart")) || [];

            const updatedCart = rentCart?.map(ele => {
                if (ele.id === variantId) {
                    if (type === "increase") {
                        return { ...ele, qty: ele.qty + 1 };
                    } else {
                        return { ...ele, qty: ele.qty > 1 ? ele.qty - 1 : 1 };
                    }
                }
                return ele;
            });

            // 3️⃣ Save updated cart immediately to localStorage + Redux
            localStorage.setItem("rentCart", JSON.stringify(updatedCart));
            if (type === "increase") {
                dispatch(addToRentCart({ id: variantId }));
            } else {
                dispatch(decreaseRentQty(variantId));
            }

            const orderId = localStorage.getItem("orderId");
            if (orderId) {
                const rentAddress = JSON.parse(localStorage.getItem("rentalAddress"));
                const saleAddress = JSON.parse(localStorage.getItem("saleAddress"));

                const payload = {
                    sale_addresses: saleAddress?.id || "",
                    rental_addresses: rentAddress?.id || "",
                    order_details: [
                        ...(JSON.parse(localStorage.getItem("buyCart")) || [])?.map(ele => ({
                            variant: ele.id,
                            item_type: ele.type,
                            quantity: ele.qty,
                        })),
                        ...updatedCart?.map(ele => ({
                            variant: ele.id,
                            quantity: ele.qty,
                            item_type: "rental",
                            rental_start_date: ele.fromDate,
                            rental_end_date: ele.toDate,
                        })),
                    ],
                };

                await axiosConfig.patch(`/accounts/orders/${orderId}/`, payload);
            }

            // 5️⃣ Now refresh rental charges + order details from server
            const res = await axiosConfig.post("/accounts/rental_charges/", {
                variants: updatedCart?.map(e => ({
                    variant_id: e.id,
                    quantity: e.qty,
                    from_date: e.fromDate,
                    to_date: e.toDate,
                })),
            });
            setRentalData(res?.data?.results || []);

            const orderRes = await axiosConfig(
                `/accounts/orderdetails/?order=${localStorage.getItem("orderId")}`
            );
            setOrderData(orderRes?.data?.results || []);
        } catch (err) {
            console.error("Update error:", err);
        }
    }
    async function handleDateUpdate(variantId) {
        try {
            const orderId = localStorage.getItem("orderId");
            if (!orderId) return;

            const rentCart = JSON.parse(localStorage.getItem("rentCart")) || [];
            const buyCart = JSON.parse(localStorage.getItem("buyCart")) || [];
            const rentAddress = JSON.parse(localStorage.getItem("rentalAddress"));
            const saleAddress = JSON.parse(localStorage.getItem("saleAddress"));

            const payload = {
                sale_addresses: saleAddress?.id || "",
                rental_addresses: rentAddress?.id || "",
                order_details: [
                    ...buyCart?.map(ele => ({
                        variant: ele.id,
                        item_type: ele.type,
                        quantity: ele.qty,
                    })),
                    ...rentCart?.map(ele => ({
                        variant: ele.id,
                        quantity: ele.qty,
                        item_type: "rental",
                        rental_start_date: ele.fromDate,
                        rental_end_date: ele.toDate,
                    })),
                ],
            };

            await axiosConfig.patch(`/accounts/orders/${orderId}/`, payload);

            // 🔄 Refresh rental charges + order details
            const res = await axiosConfig.post("/accounts/rental_charges/", {
                variants: rentCart?.map(e => ({
                    variant_id: e.id,
                    quantity: e.qty,
                    from_date: e.fromDate,
                    to_date: e.toDate,
                })),
            });
            setRentalData(res?.data?.results || []);

            const orderRes = await axiosConfig(
                `/accounts/orderdetails/?order=${orderId}`
            );
            setOrderData(orderRes?.data?.results || []);
        } catch (err) {
            console.error("Error updating rental dates:", err);
        }
    }
    async function handleDeleteItem(variantId, type) {
        try {
            const orderId = localStorage.getItem("orderId");
            if (!orderId) return;

            if (type === "rental") {
                const rentCart = JSON.parse(localStorage.getItem("rentCart")) || [];
                const updatedRentCart = rentCart.filter(e => e.id !== variantId);
                localStorage.setItem("rentCart", JSON.stringify(updatedRentCart));
                dispatch(removeFromRentCart(variantId));
            } else {
                const buyCart = JSON.parse(localStorage.getItem("buyCart")) || [];
                const updatedBuyCart = buyCart.filter(e => e.id !== variantId);
                localStorage.setItem("buyCart", JSON.stringify(updatedBuyCart));
                dispatch(removeFromBuyCart(variantId));
            }

            const rentCart = JSON.parse(localStorage.getItem("rentCart")) || [];
            const buyCart = JSON.parse(localStorage.getItem("buyCart")) || [];
            const rentAddress = JSON.parse(localStorage.getItem("rentalAddress"));
            const saleAddress = JSON.parse(localStorage.getItem("saleAddress"));

            const payload = {
                sale_addresses: buyCart.length > 0 ? saleAddress?.id || "" : "",
                rental_addresses: rentCart.length > 0 ? rentAddress?.id || "" : "",
                order_details: [
                    ...buyCart?.map(ele => ({
                        variant: ele.id,
                        item_type: ele.type,
                        quantity: ele.qty,
                    })),
                    ...rentCart?.map(ele => ({
                        variant: ele.id,
                        quantity: ele.qty,
                        item_type: "rental",
                        rental_start_date: ele.fromDate,
                        rental_end_date: ele.toDate,
                    })),
                ],
            };

            await axiosConfig.patch(`/accounts/orders/${orderId}/`, payload);

            if (rentCart.length > 0) {
                const res = await axiosConfig.post("/accounts/rental_charges/", {
                    variants: rentCart?.map(e => ({
                        variant_id: e.id,
                        quantity: e.qty,
                        from_date: e.fromDate,
                        to_date: e.toDate,
                    })),
                });
                setRentalData(res?.data?.results || []);
            } else {
                setRentalData([]);
            }

            const orderRes = await axiosConfig(
                `/accounts/orderdetails/?order=${orderId}`
            );
            setOrderData(orderRes?.data?.results || []);

            toast.success("Item removed successfully!");
        } catch (err) {
            console.error("Error deleting item:", err);
            toast.error("Failed to remove item");
        }
    }

    async function handleBuyQtyUpdate(item, type) {
        try {
            const variantId = item?.varient?.id ?? item?.id;

            // 1️⃣ Get latest buyCart from localStorage
            const buyCart = JSON.parse(localStorage.getItem("buyCart")) || [];

            // 2️⃣ Update quantity locally
            const updatedCart = buyCart?.map(ele => {
                if (ele.id === variantId) {
                    if (type === "increase") {
                        return { ...ele, qty: ele.qty + 1 };
                    } else {
                        return { ...ele, qty: ele.qty > 1 ? ele.qty - 1 : 1 };
                    }
                }
                return ele;
            });

            // 3️⃣ Update Redux + localStorage
            localStorage.setItem("buyCart", JSON.stringify(updatedCart));
            if (type === "increase") {
                dispatch(addToBuyCart({ id: variantId }));
            } else {
                dispatch(decreaseBuyQty(variantId));
            }

            // 4️⃣ Sync with backend
            const orderId = localStorage.getItem("orderId");
            if (orderId) {
                const rentCart = JSON.parse(localStorage.getItem("rentCart")) || [];
                const rentAddress = JSON.parse(localStorage.getItem("rentalAddress"));
                const saleAddress = JSON.parse(localStorage.getItem("saleAddress"));

                const payload = {
                    sale_addresses: saleAddress?.id || "",
                    rental_addresses: rentCart.length > 0 ? rentAddress?.id || "" : "",
                    order_details: [
                        ...updatedCart?.map(ele => ({
                            variant: ele.id,
                            item_type: "sale",
                            quantity: ele.qty,
                        })),
                        ...rentCart?.map(ele => ({
                            variant: ele.id,
                            quantity: ele.qty,
                            item_type: "rental",
                            rental_start_date: ele.fromDate,
                            rental_end_date: ele.toDate,
                        })),
                    ],
                };

                await axiosConfig.patch(`/accounts/orders/${orderId}/`, payload);
            }

            // 5️⃣ Refresh order details
            const orderRes = await axiosConfig(
                `/accounts/orderdetails/?order=${localStorage.getItem("orderId")}`
            );
            setOrderData(orderRes?.data?.results || []);
        } catch (err) {
            console.error("Update error:", err);
        }
    }

    return (
        <>
            <CheckoutNavbar />
            <div className="cart-container">
                <div className="cart-left">
                    {

                        <>
                            {
                                buyCart.length > 0 && (
                                    <>
                                        <div className='cart-delivery-estimate'>
                                            <div className='cart-delivery-estimate-left'>
                                                <div>
                                                    <p className='deliver-address'>Delivering to : <span>{saleAddress?.name || ""}</span></p>
                                                    <p className='delivery-full-add'>
                                                        Floor : {saleAddress.flat_no}, {saleAddress.address_line_1}, {saleAddress.address_line_2}, {saleAddress.landmark}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className='cart-delivery-estimate-right'>
                                                <button onClick={() => navigate("/address", { state: { addressType: 'sale' } })}>change</button>
                                            </div>
                                        </div>
                                        <div className="cart-section-box">
                                            <div className="cart-section-header">
                                                Buy Cart <span>{buyCart.length} items</span>
                                            </div>

                                            {
                                                orderData?.map((item) => (
                                                    item.item_type === "sale" && (
                                                        <div className="cart-item" key={item?.id}>
                                                            <div className="cart-item-image" onClick={() =>
                                                                navigate(`/${item.item_type}/product/${item?.varient?.slug}`, {
                                                                    state: { item, listingType: item.item_type }
                                                                })
                                                            }>
                                                                <img src={item?.varient?.images[0]?.image?.image} alt={item.name} />
                                                            </div>

                                                            <div className="cart-item-info" onClick={() =>
                                                                navigate(`/${item.item_type}/product/${item?.varient?.slug}`, {
                                                                    state: { item, listingType: item.item_type }
                                                                })
                                                            }>
                                                                <p className="cart-item-title">{item?.varient?.name}</p>

                                                                <div className="cart-item-prices mt-2">
                                                                    <span className="old-price">{formatPrice(item.price)}</span>
                                                                    <span className="discount-badge">
                                                                        -{Math.round(Number(((item.price - item.offer_price) / item.price)) * 100)}%
                                                                    </span>
                                                                    <span className="new-price">{formatPrice(item.offer_price)}</span>
                                                                </div>
                                                            </div>

                                                            <div className="cart-item-actions">

                                                                <div className="qty-wrapper">
                                                                    <button className="qty-minus" onClick={() => handleBuyQtyUpdate(item, "decrease")}>−</button>
                                                                    <span className="qty-value">{item.quantity}</span>
                                                                    <button className="qty-plus" onClick={() => handleBuyQtyUpdate(item, "increase")}>+</button>
                                                                </div>


                                                                <div className="delete-icon" ><FiTrash2 onClick={() => handleDeleteItem(item.varient.id, "sale")} /></div>
                                                            </div>
                                                        </div>
                                                    )
                                                ))
                                            }
                                        </div>
                                    </>
                                )
                            }

                        </>

                    }
                    {

                        rentCart.length > 0 && (
                            <div className='mt-3'>
                                {
                                    rentalAddress ? (
                                        <div className='cart-delivery-estimate'>
                                            <div className='cart-delivery-estimate-left'>
                                                <div>
                                                    <p className='deliver-address'>Delivering to : <span>{rentalAddress?.name}</span></p>
                                                    <p className='delivery-full-add'>
                                                        Floor : {rentalAddress.flat_no}, {rentalAddress.address_line_1}, {rentalAddress.address_line_2}, {rentalAddress.landmark}, {rentalAddress.city}{rentalAddress.state}{rentalAddress.country}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className='cart-delivery-estimate-right'>
                                                <button onClick={() => navigate("/address", { state: { addressType: 'rental' } })}>change</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className='cart-delivery-estimate'>
                                            <div className='cart-delivery-estimate-left'>
                                                <TbTruckDelivery className='truck-icon' />
                                                <div>
                                                    <p className='delivery-title'>Delivery Estimate</p>
                                                    <p className='delivery-detail'>
                                                        Delivery by <strong>31 Oct</strong> to <span>500457</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className='cart-delivery-estimate-right'>
                                                <p className='price-cut'><strike>₹499</strike></p>
                                                <p className='price-free'>FREE</p>
                                            </div>
                                        </div>
                                    )
                                }
                                <div className="cart-section-box mb-4">
                                    <div className="cart-section-header">
                                        Rent Cart <span>{rentCart.length} items</span>
                                    </div>
                                    {orderData?.map(item => (
                                        item.item_type === "rental" && (
                                            <div className="cart-item" key={item.id}>
                                                <div
                                                    className="cart-item-image"
                                                    onClick={() =>
                                                        navigate(`/${item.item_type}/product/${item?.varient?.slug}`, {
                                                            state: { item, listingType: item.item_type }
                                                        })
                                                    }
                                                >
                                                    <img src={item?.varient?.images[0]?.image?.image} alt={item?.varient?.name} />
                                                </div>
                                                <div
                                                    className="cart-item-info"
                                                    onClick={() =>
                                                        navigate(`/${item.item_type}/product/${item?.varient?.slug}`, {
                                                            state: { item, listingType: item.item_type }
                                                        })
                                                    }>
                                                    <p className="cart-item-title">{item?.varient?.name}</p>

                                                    <div className="cart-item-prices mt-2">
                                                        <span className="old-price">{formatPrice(item.price)}</span>
                                                        <span className="discount-badge">-{item.slab_percentage} %</span>
                                                        <span className="new-price">{formatPrice(item.total_price)}</span>
                                                    </div>


                                                </div>
                                                <div className="cart-item-actions">
                                                    <div>
                                                        <div className="month-container"
                                                            onClick={() => {
                                                                setShowMonth(true);
                                                                setSelectedItemId(item.varient.id); // use variant id
                                                            }}>

                                                            <>
                                                                <div>{item.rental_duration_days}/Days</div> <BiChevronDown className='month-icon' />
                                                            </>

                                                        </div>
                                                        <div className="qty-wrapper mt-2">
                                                            <button
                                                                className="qty-minus"
                                                                onClick={() => handleRentQtyUpdate(item, "decrease")}
                                                            >
                                                                −
                                                            </button>

                                                            <span className="qty-value">{item.quantity}</span>

                                                            <button
                                                                className="qty-plus"
                                                                onClick={() => handleRentQtyUpdate(item, "increase")}
                                                            >
                                                                +
                                                            </button>
                                                        </div>

                                                    </div>
                                                    <div className="delete-icon">
                                                        <FiTrash2 onClick={() => handleDeleteItem(item.varient.id, "rental")} />
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                        )

                    }
                </div>
                <div className="cart-right">
                    <div className='cart-right-fix-box'>
                        {
                            buyCart.length > 0 && (
                                <div className='buy-rent-price-container'>
                                    <div className='left-buy-rent-price'><div className="clock-wrapper"><BiCheckCircle className="styled-clock" /></div><span>Buy</span></div>
                                    <div className='total-price'>{formatPrice(orderData[0]?.order?.sale_total_amount)}</div>
                                </div>
                            )
                        }
                        {
                            rentCart.length > 0 && (
                                <div className='buy-rent-price-container mt-2'>
                                    <div className='left-buy-rent-price'><div className="clock-wrapper"><FaRegClock className="styled-clock" /></div><span>Rent</span></div>
                                    <div className='total-price'>{formatPrice(orderData[0]?.order?.rental_total_amount)}</div>
                                </div>
                            )
                        }
                        <div className='choose-transport'>
                            <div><button className={`transpport-btn ${deliveryType === "company-transport" ? "active" : ""}`} onClick={() => setDeliveryType("company-transport")}>Company Transport</button></div>
                            <div><button className={`transpport-btn ${deliveryType === "self-transport" ? "active" : ""}`} onClick={() => setDeliveryType("self-transport")}>Self Transport</button></div>
                        </div>
                        <div className='cart-btn mt-3' onClick={proceedToCheckout}>
                            <div>{formatPrice(orderData[0]?.order?.total_amount)}</div>
                            <div>
                                PROCEED <IoArrowForward size={17} />
                            </div>
                        </div>
                    </div>
                    <div className='price-breakup-section'>
                        {
                            orderData.length > 0 && (
                                <>
                                    <div className='breakup-background'>
                                        <div className='break-header'><h4>Rent Cost Breakup</h4><button>Hide Breakup <BiChevronDown className='break-icon' size={15} /></button></div>

                                        <div>
                                            {
                                                orderData.length > 0 &&
                                                <div className='data-container-parent'>
                                                    {orderData?.map((item) => (
                                                        item.item_type === "rental" && (
                                                            <div className='data-container' key={item?.id}>
                                                                <div className='break-item-title'>{item.varient.name} × {item.quantity}</div>
                                                                <div className="breakup-item">
                                                                    <div>(A) Base Rental Cost</div>
                                                                    <div>{formatPrice(item.price)}/Day</div>
                                                                </div>
                                                                <div className="breakup-item">
                                                                    <div>(B) Duration</div>
                                                                    <div>{item.rental_duration_days}-Days</div>
                                                                </div>
                                                                <div className="breakup-item">
                                                                    <div>(C) Quantity</div>
                                                                    <div>{item.quantity} Qty</div>
                                                                </div>
                                                                <div className="breakup-item">
                                                                    <div>(D) Total Price (A*B*C)</div>
                                                                    <div>{formatPrice(item.price * item.rental_duration_days * item.quantity)} </div>
                                                                </div>
                                                                <div className="breakup-item text-success">
                                                                    <div>(E) Rental Discount</div>
                                                                    <div>-{Math.round(Number(item?.slab_percentage))}%  -{formatPrice(Math.round((item.price * item.rental_duration_days * item.quantity) - (item.total_price)))}</div>
                                                                </div>
                                                                <div className="breakup-item">
                                                                    <div>Net Amount</div>
                                                                    <div>{formatPrice(item?.total_price)}</div>
                                                                </div>
                                                                <div className='discount-green'>You Will Save {formatPrice(Math.round((item.price * item.rental_duration_days * item.quantity) - (item.total_price)))}</div>
                                                            </div>
                                                        )
                                                    ))}
                                                    {
                                                        deliveryType === "company-transport" && <div className="breakup-item">
                                                            <div>Delivery Charges</div>
                                                            <div>
                                                                {priceBreakup?.map((rb, index) => (
                                                                    rb.cart_type === "rent" && <div key={index}>{rb.delivery_charges}</div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    }
                                                    <div className="breakup-item">
                                                        <div>Rental Total</div>
                                                        <div>{formatPrice(orderData[0]?.order?.rental_total_amount)}</div>
                                                    </div>
                                                </div>

                                            }
                                        </div>
                                    </div>

                                    <div className='breakup-background'>
                                        <div className='break-header'><h4>Buy Cost Breakup</h4><button>Hide Breakup <BiChevronDown className='break-icon' size={15} /></button></div>
                                        <div>
                                            {
                                                orderData.length > 0 &&
                                                <div className='data-container-parent'>
                                                    {
                                                        orderData?.map((item) => (
                                                            item.item_type === "sale" && (
                                                                <div className='data-container' key={item?.id}>
                                                                    <div className='break-item-title'>{item.varient.name} × {item.quantity}</div>
                                                                    <div className="breakup-item"><div>(A) Base Sale Cost</div><div>{formatPrice(item.price)}</div></div>
                                                                    <div className="breakup-item text-success"><div>(B) Sale Discount</div><div>-{Math.round(Number(((item.price - item.offer_price) / item.price)) * 100)}%  -{(item.price) - (item.total_price)}</div></div>
                                                                    <div className="breakup-item"><div>(C) Net Price {"   "} (A-B)</div><div>{formatPrice(item.total_price)}</div></div>
                                                                    <div className='discount-green'>You Will Save {formatPrice(Math.round(Number((item.price) - (item.total_price))))}</div>
                                                                </div>
                                                            )
                                                        ))
                                                    }
                                                    {
                                                        deliveryType === "company-transport" && <div className="breakup-item">
                                                            <div>Delivery Charges</div>
                                                            <div>
                                                                {priceBreakup?.map((rb, index) => (
                                                                    rb.cart_type === "rent" && <div key={index}>{rb.delivery_charges}</div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    }
                                                    <div className="breakup-item">
                                                        <div>Sale Total</div>
                                                        <div>{formatPrice(orderData[0]?.order?.sale_total_amount)}</div>
                                                    </div>
                                                </div>

                                            }

                                        </div>
                                    </div>
                                </>

                            )
                        }
                    </div>
                </div>
            </div>
            <MonthOffcanvas showMonth={showMonth} handleClose={() => setShowMonth(false)} selectedItemId={selectedItemId} onConfirmDates={handleDateUpdate} />
            {!userId && <LoginModal show={loginModal} onHide={() => setLoginModal(false)} onLoginSuccess={handleLoginSuccess} />}
        </>
    )
}

export default Checkout

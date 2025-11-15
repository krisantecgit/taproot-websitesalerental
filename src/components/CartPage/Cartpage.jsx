import React, { useEffect, useState } from 'react'
import { TbTruckDelivery } from 'react-icons/tb'
import { FaArrowRight, FaRegClock } from 'react-icons/fa6'
import Header from '../header/Header'
import "./cartpage.css"
import { useDispatch, useSelector } from 'react-redux'
import { FiTrash2 } from 'react-icons/fi'
import { addToBuyCart, addToRentCart, decreaseBuyQty, decreaseRentQty, removeFromBuyCart, removeFromRentCart } from '../../redux/cartSlice'
import { useNavigate } from 'react-router-dom'
import { BiCheckCircle, BiChevronDown } from 'react-icons/bi'
import MonthOffcanvas from './MonthCanva'
import axiosConfig from "../../Services/axiosConfig"
import { IoArrowForward, IoTime } from 'react-icons/io5'
import LoginModal from '../Login/Login'
import { toast } from 'react-toastify'

function Cartpage() {
    const { buyCart, rentCart } = useSelector(store => store.cart)
    const [showMonth, setShowMonth] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [rentalData, setRentalData] = useState([])
    const [loginModal, setLoginModal] = useState(false)
    const [userId, setUserId] = useState(localStorage.getItem("userid"))
    const dispatch = useDispatch();
    let navigate = useNavigate()
    const formatPrice = (price) =>
        price?.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).replace("$", "$ ");
    useEffect(() => {
        if (rentCart.length === 0) return;
        const data = rentCart.map((ele) => ({
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
    const totalRentPrice = rentalData.reduce((acc, ele) => acc + ele.final_cost, 0);
    const totalBuyPrice = buyCart.reduce((acc, ele) => acc + ele.offerPrice * ele.qty, 0);
    const totalAmount = (buyCart.length ? totalBuyPrice : 0) + (rentCart.length ? totalRentPrice : 0);
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
        if (!userId) {
            toast.error("Please log in to proceed");
            setLoginModal(true);
            return;
        }
        if (userId && !saleAddress && buyCart.length > 0) {
            toast.error("Please select sale delivery address");
            navigate('/address', { state: { addressType: 'sale' } });
            return;
        }

        if (userId && !rentalAddress && rentCart.length > 0) {
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
                ...buyCart.map((ele) => ({
                    variant: ele.id,
                    item_type: ele.type,
                    quantity: ele.qty
                })),
                ...rentCart.map((ele) => ({
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
                navigate('/checkout');
            } else {
                const res = await axiosConfig.post(`/accounts/orders/`, payload);
                localStorage.setItem("orderId", res?.data?.id)
                navigate('/checkout');
            }
        } catch (error) {
            console.log(error)
        }
    }
    return (
        <>
            <Header />
            {
                (buyCart.length + rentCart.length > 0) ?
                    <div className="cart-container">
                        <div className="cart-left">
                            {
                                buyCart.length > 0 && (
                                    <>
                                        {
                                            saleAddress ? (
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
                                            ) : (
                                                <div className='cart-delivery-estimate'>
                                                    <div className='cart-delivery-estimate-left'>
                                                        {/* <TbTruckDelivery className='truck-icon' />
                                                <div>
                                                    <p className='delivery-title'>Delivery Estimate</p>
                                                    <p className='delivery-detail'>
                                                        Delivery by <strong>31 Oct</strong> to <span>500457</span>
                                                    </p>
                                                </div> */}
                                                        <p className='delivery-detail'>
                                                            Select address
                                                        </p>

                                                    </div>
                                                    <div className='cart-delivery-estimate-right'>
                                                        {/* <p className='price-cut'><strike>₹499</strike></p>
                                                <p className='price-free'>FREE</p> */}
                                                        {
                                                            userId ? <button onClick={() => navigate("/address", { state: { addressType: 'sale' } })}>Choose</button> : <button onClick={() => setLoginModal(true)}>Choose</button>
                                                        }
                                                    </div>
                                                </div>
                                            )
                                        }
                                        <div className="cart-section-box">
                                            <div className="cart-section-header">
                                                Buy Cart <span>{buyCart.length} items</span>
                                            </div>

                                            {buyCart.map(item => (
                                                <div className="cart-item">
                                                    <div className="cart-item-image" onClick={() =>
                                                        navigate(`/${item.type}/product/${item.friendlyurl}`, {
                                                            state: { item, listingType: item.type }
                                                        })
                                                    }>
                                                        <img src={item.image} alt={item.name} />
                                                    </div>

                                                    <div className="cart-item-info" onClick={() =>
                                                        navigate(`/${item.type}/product/${item.friendlyurl}`, {
                                                            state: { item, listingType: item.type }
                                                        })
                                                    }>
                                                        <p className="cart-item-title">{item.name}</p>

                                                        <div className="cart-item-prices mt-2">
                                                            <span className="old-price">{formatPrice(item.oldPrice)}</span>
                                                            <span className="discount-badge">
                                                                -{Math.round(((item.oldPrice - item.offerPrice) / item.oldPrice) * 100)}%
                                                            </span>
                                                            <span className="new-price">{formatPrice(item.offerPrice)}</span>
                                                        </div>
                                                    </div>

                                                    <div className="cart-item-actions">

                                                        <div className="qty-wrapper">
                                                            <button className="qty-minus" onClick={() => dispatch(decreaseBuyQty(item.id))}>−</button>
                                                            <span className="qty-value">{item.qty}</span>
                                                            <button className="qty-plus" onClick={() => dispatch(addToBuyCart(item))}>+</button>
                                                        </div>

                                                        <div className="delete-icon" ><FiTrash2 onClick={() => dispatch(removeFromBuyCart(item.id))} /></div>
                                                    </div>
                                                </div>

                                            ))}
                                        </div>
                                    </>
                                )
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
                                                        {/* <TbTruckDelivery className='truck-icon' /> */}
                                                        <p className='delivery-detail'>
                                                            Select address
                                                        </p>
                                                        <div>
                                                            {/* <p className='delivery-title'>Delivery Estimate</p>
                                                    <p className='delivery-detail'>
                                                        Delivery by <strong>31 Oct</strong> to <span>500457</span>
                                                    </p> */}


                                                        </div>
                                                    </div>
                                                    <div className='cart-delivery-estimate-right'>
                                                        {/* <p className='price-cut'><strike>₹499</strike></p>
                                                <p className='price-free'>FREE</p> */}
                                                        {
                                                            userId ? <button onClick={() => navigate("/address", { state: { addressType: 'rental' } })}>Choose</button> : <button onClick={() => setLoginModal(true)}>Choose</button>
                                                        }
                                                    </div>
                                                </div>
                                            )
                                        }
                                        <div className="cart-section-box mb-4">
                                            <div className="cart-section-header">
                                                Rent Cart <span>{rentCart.length} items</span>
                                            </div>
                                            {rentCart.map(item => (
                                                <div className="cart-item" key={item.id}>
                                                    <div
                                                        className="cart-item-image"
                                                        onClick={() =>
                                                            navigate(`/${item.type}/product/${item.friendlyurl}`, {
                                                                state: { item, listingType: item.type }
                                                            })
                                                        }
                                                    >
                                                        <img src={item.image} alt={item.name} />
                                                    </div>
                                                    <div
                                                        className="cart-item-info"
                                                        onClick={() =>
                                                            navigate(`/${item.type}/product/${item.friendlyurl}`, {
                                                                state: { item, listingType: item.type }
                                                            })
                                                        }>
                                                        <p className="cart-item-title">{item.name}</p>
                                                        {
                                                            (() => {
                                                                const matchedRental = rentalData.find(r => r.variant_id === item.id);
                                                                return matchedRental ? (
                                                                    <div className="cart-item-prices mt-2">
                                                                        <span className="old-price">{formatPrice(matchedRental.base_cost)}</span>
                                                                        <span className="discount-badge">-{matchedRental.discount_percent} %</span>
                                                                        <span className="new-price">{formatPrice(matchedRental.final_cost)}</span>
                                                                    </div>
                                                                ) : null;
                                                            })()
                                                        }
                                                    </div>
                                                    <div className="cart-item-actions">
                                                        <div>
                                                            <div className="month-container" onClick={() => { setShowMonth(true); setSelectedItemId(item.id) }}>
                                                                {
                                                                    (() => {
                                                                        const matchedRental = rentalData.find(r => r.variant_id === item.id);
                                                                        return matchedRental ? (
                                                                            <>
                                                                                <div>{matchedRental.duration_days}/Days</div> <BiChevronDown className='month-icon' />
                                                                            </>
                                                                        ) : null
                                                                    })()
                                                                }
                                                            </div>
                                                            <div className="qty-wrapper mt-2">
                                                                <button
                                                                    className="qty-minus"
                                                                    onClick={() => dispatch(decreaseRentQty(item.id))}
                                                                >
                                                                    −
                                                                </button>

                                                                <span className="qty-value">{item.qty}</span>

                                                                <button
                                                                    className="qty-plus"
                                                                    onClick={() => dispatch(addToRentCart(item))}
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="delete-icon">
                                                            <FiTrash2 onClick={() => dispatch(removeFromRentCart(item.id))} />
                                                        </div>
                                                    </div>
                                                </div>
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
                                            <div className='total-price'>{formatPrice(totalBuyPrice)}</div>
                                        </div>
                                    )
                                }
                                {
                                    rentCart.length > 0 && (
                                        <div className='buy-rent-price-container mt-2'>
                                            <div className='left-buy-rent-price'><div className="clock-wrapper"><FaRegClock className="styled-clock" /></div><span>Rent</span></div>
                                            <div className='total-price'>{formatPrice(totalRentPrice)}</div>
                                        </div>
                                    )
                                }
                                <div className='cart-btn mt-3' onClick={proceedToCheckout}>
                                    <div>{formatPrice(totalAmount)}</div>
                                    <div>
                                        {
                                            userId ?
                                                <div>
                                                    CHECK OUT <IoArrowForward size={17} />
                                                </div>
                                                :
                                                <div onClick={() => setLoginModal(true)}>Login To Proceed</div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> :
                    <div className="empty-cart-container">

                        <h2>Your Cart Looks A little Empty!</h2>
                        <p>Start Buying or Renting with us</p>

                        <div className="empty-cart-image-box">
                            {/* replace this with your image */}
                            <img src={require("../Assets/cart-bg.png")} alt="empty cart" />
                        </div>

                        <div className="empty-cart-options">
                            <div className="option-left">
                                <p>Looking to<br />BUY furniture?</p>
                            </div>

                            <div className="option-right">
                                <p>Looking to<br />RENT furniture?</p>
                            </div>
                        </div>

                        <div className="empty-cart-buttons">
                            <button className="buy-btn" onClick={() => {navigate("/buy"); window.scrollTo({top : 0, behavior:"smooth"})} }>
                                <span className="arrow-left">←</span><span className='btn-text'>EXPLORE BUYING</span>
                            </button>

                            <button className="rent-btn" onClick={() => {navigate("/rent"); window.scrollTo({top : 0, behavior:"smooth"})} }>
                                <span className='btn-text'>EXPLORE RENTING</span><span className="arrow-right">→</span>
                            </button>
                        </div>

                    </div>

            }
            <MonthOffcanvas showMonth={showMonth} handleClose={() => setShowMonth(false)} selectedItemId={selectedItemId} />
            {!userId && <LoginModal show={loginModal} onHide={() => setLoginModal(false)} onLoginSuccess={handleLoginSuccess} />}
        </>
    )
}

export default Cartpage

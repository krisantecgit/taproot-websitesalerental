import React from 'react'
import { TbTruckDelivery } from 'react-icons/tb'
import { FaArrowRight } from 'react-icons/fa6'
import Header from '../header/Header'
import "./cartpage.css"
import { useDispatch, useSelector } from 'react-redux'
import { FiTrash2 } from 'react-icons/fi'
import { addToBuyCart, addToRentCart, decreaseBuyQty, decreaseRentQty, removeFromBuyCart, removeFromRentCart } from '../../redux/cartSlice'
import { useNavigate } from 'react-router-dom'

function Cartpage() {
    const { buyCart, rentCart } = useSelector(store => store.cart)
    const dispatch = useDispatch();
    let navigate = useNavigate()
    const formatPrice = (price) =>
        price?.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).replace("$", "$ ");
    return (
        <>
            <Header />
            <div className="cart-container">
                <div className="cart-left">
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
                    <div className="cart-section-box mb-4">
                        <div className="cart-section-header">
                            Rent Cart <span>{rentCart.length} items</span>
                        </div>

                        {rentCart.map(item => (
                            <div className="cart-item" key={item.id}>

                                {/* IMAGE */}
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

                                {/* INFO */}
                                <div
                                    className="cart-item-info"
                                    onClick={() =>
                                        navigate(`/${item.type}/product/${item.friendlyurl}`, {
                                            state: { item, listingType: item.type }
                                        })
                                    }
                                >
                                    <p className="cart-item-title">{item.name}</p>

                                    {/* ✅ RENT PRICE ONLY */}
                                    <div className="cart-item-prices mt-2">
                                        <span className="new-price">{`${formatPrice(item.offerPrice)}/Day`}</span>
                                        <span className="rent-day-text"></span>
                                    </div>
                                </div>

                                {/* ACTIONS */}
                                <div className="cart-item-actions">
                                    <div className="qty-wrapper">
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

                                    <div className="delete-icon">
                                        <FiTrash2 onClick={() => dispatch(removeFromRentCart(item.id))} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>


                </div>

                <div className="cart-right">
                    <div className="checkout-box">
                        <div className="price-summary">
                            <div className="buy">
                                <input type="radio" checked readOnly /> <label>Buy</label>
                                <span>₹28,999.00</span>
                            </div>
                            <div className="rent">
                                <input type="radio" /> <label>Rent (12 Months)</label>
                                <span>₹34,429.19</span>
                            </div>
                        </div>
                        <button className="checkout-btn">
                            ₹63,428.19 CHECKOUT <FaArrowRight className="checkout-icon" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Cartpage

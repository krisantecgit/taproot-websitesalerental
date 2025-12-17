import React, { useEffect, useState } from 'react'
import { TbTruckDelivery } from 'react-icons/tb'
import { FaArrowRight, FaRegClock } from 'react-icons/fa6'
import Header from '../header/Header'
import "./cartpage.css"
import { useDispatch, useSelector } from 'react-redux'
import { FiTrash2 } from 'react-icons/fi'
import { addToBuyCart, addToRentCart, decreaseBuyQty, decreaseRentQty, removeFromBuyCart, removeFromRentCart, setRentalPackage } from '../../redux/cartSlice'
import { useNavigate } from 'react-router-dom'
import { BiCheckCircle, BiChevronDown } from 'react-icons/bi'
import axiosConfig from "../../Services/axiosConfig"
import { IoArrowForward } from 'react-icons/io5'
import LoginModal from '../Login/Login'
import { toast } from 'react-toastify'
import DeleteCartItemModal from './DeleteCartItemModal'
import PackagesPlan from './Packages'

function Cartpage() {
    const { buyCart, rentCart } = useSelector(store => store.cart)
    const [showMonth, setShowMonth] = useState(false);
    const [showCartDelete, setShowCartDelete] = useState(false)
    const [packagesByVariant, setPackagesByVariant] = useState({});
    const [selectedItem, setSelectedItem] = useState(null)
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [loginModal, setLoginModal] = useState(false)
    const [userId, setUserId] = useState(localStorage.getItem("userid"))
    const dispatch = useDispatch();
    let navigate = useNavigate()

    const formatPrice = (price) =>
        price?.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            // minimumFractionDigits: 0,
            // maximumFractionDigits: 0,
        }).replace("$", "$ ");

    useEffect(() => {
        if (rentCart.length === 0) {
            setPackagesByVariant({});
            return;
        }

        async function getRentalData() {
            try {
                const responses = await Promise.all(
                    rentCart.map(item =>
                        axiosConfig(
                            `/catlog/variant-price-packages/?product_variant=${item.id}&active=true`
                        )
                    )
                );

                // Process each response
                responses.forEach((res, index) => {
                    const item = rentCart[index];
                    const packages = res?.data?.results || [];

                    if (packages.length > 0) {
                        // Store packages by variant ID
                        setPackagesByVariant(prev => ({
                            ...prev,
                            [item.cartItemId]: packages
                        }));

                        // Auto-select first package if none selected
                        if (!item.selectedPackage && packages[0]) {
                            dispatch(setRentalPackage({
                                cartItemId: item.cartItemId,
                                packageData: packages[0]
                            }));
                        }
                    }
                });
            } catch (error) {
                console.log("Error fetching rental packages:", error);
            }
        }

        getRentalData();
    }, [rentCart, dispatch]);

    const handlePackageSelect = (cartItemId, packageData) => {
        dispatch(setRentalPackage({ cartItemId, packageData }));
    };

    // Calculate total rent price based on selected packages
    const totalRentPrice = rentCart.reduce((acc, item) => {
        if (item.selectedPackage) {
            return acc + (parseFloat(item.selectedPackage.offer_price) * item.qty);
        }
        return acc;
    }, 0);

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

        // Check if all rental items have selected packages
        const missingPackages = rentCart.filter(item => !item.selectedPackage);
        if (missingPackages.length > 0) {
            toast.error("Please select packages for all rental items");
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
                    package_name: ele.selectedPackage.package_name,
                    duration_value: ele.selectedPackage.duration_value,
                    unique_id: ele.cartItemId
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

    const addToWishList = async (item) => {
        const payload = {
            user: userId,
            varient: item?.id,
            type: item?.type === "buy" ? "sale" : "rental"
        }
        try {
            await axiosConfig.post(`/catlog/wishlists/`, payload)
        } catch (error) {
            console.log(error)
        }
    }

    const handleMoveToWishlist = async (selectedItem) => {
        if (!userId) {
            toast.error("Please log in to move to wishlist");
            setLoginModal(true);
            return;
        }

        try {
            const payload = {
                user: userId,
                varient: selectedItem?.id, // Use product variant ID for wishlist
                type: selectedItem?.type === "buy" ? "sale" : "rental"
            };

            await axiosConfig.post(`/catlog/wishlists/`, payload);
            toast.success("Item moved to wishlist successfully");

            // Remove from cart - use correct identifier
            if (selectedItem.type === "buy") {
                // For buy items, use id
                dispatch(removeFromBuyCart(selectedItem.id));
            } else {
                // For rent items, use cartItemId
                dispatch(removeFromRentCart(selectedItem.cartItemId));
            }

            setShowCartDelete(false);
        } catch (error) {
            console.log(error);
            toast.error("Failed to move item to wishlist");
        }
    }

    const handleRemoveCart = async (selectedItem) => {
        // Remove from cart - use correct identifier
        if (selectedItem.type === "buy") {
            // For buy items, use id
            dispatch(removeFromBuyCart(selectedItem.id));
            toast.success("Item removed from cart");
        } else {
            // For rent items, use cartItemId
            dispatch(removeFromRentCart(selectedItem.cartItemId));
            toast.success("Item removed from cart");
        }

        setShowCartDelete(false);
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
                                                                Floor : {saleAddress.flat_no}, {saleAddress.address_line_1}, {saleAddress.address_line_2}, {saleAddress.landmark}, {saleAddress.city}{saleAddress.state}{saleAddress.country}
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
                                                        <p className='delivery-detail'>
                                                            Select address
                                                        </p>

                                                    </div>
                                                    <div className='cart-delivery-estimate-right'>
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

                                                        <div className="delete-icon" ><FiTrash2 onClick={() => { setShowCartDelete(true); setSelectedItem(item) }} /></div>
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
                                                        </div>
                                                    </div>
                                                    <div className='cart-delivery-estimate-right'>
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
                                            {rentCart.map(item => {
                                                return (
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
                                                            {/* <div className="cart-item-prices mt-2">
                                                                <span className="old-price">${item?.selectedPackage?.price}</span>
                                                                <span className="discount-badge">
                                                                    -{item.selectedPackage.discount_percent}%
                                                                </span>
                                                                <span className="new-price">${item.selectedPackage.offer_price}</span>
                                                            </div> */}
                                                            <div className="cart-item-prices mt-2">
                                                                <span className="old-price">
                                                                    {item.selectedPackage ? `$${item.selectedPackage.price}` : "Select Package"}
                                                                </span>
                                                                {item.selectedPackage && (
                                                                    <>
                                                                        <span className="discount-badge">
                                                                            -{item.selectedPackage.discount_percent || 0}%
                                                                        </span>
                                                                        <span className="new-price">
                                                                            ${item.selectedPackage.offer_price}
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="cart-item-actions">
                                                            <div>
                                                                <div
                                                                    className="month-container"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setShowMonth(true);
                                                                        setSelectedItemId(item.cartItemId);
                                                                    }}
                                                                >
                                                                    <div>
                                                                        {item.selectedPackage ? `${item.selectedPackage.duration_value} ${item.selectedPackage.package_name}` : "Select Package"}
                                                                    </div>
                                                                    <BiChevronDown className="month-icon" />
                                                                </div>

                                                                <div className="qty-wrapper mt-2">
                                                                    <button
                                                                        className="qty-minus"
                                                                        onClick={() => dispatch(decreaseRentQty(item.cartItemId))}
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
                                                                <FiTrash2 onClick={() => {
                                                                    setShowCartDelete(true);
                                                                    setSelectedItem({
                                                                        ...item,
                                                                        type: "rent"
                                                                    });
                                                                }} />                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
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
                            <button className="buy-btn" onClick={() => { navigate("/buy"); window.scrollTo({ top: 0, behavior: "smooth" }) }}>
                                <span className="arrow-left">←</span><span className='btn-text'>EXPLORE BUYING</span>
                            </button>

                            <button className="rent-btn" onClick={() => { navigate("/rent"); window.scrollTo({ top: 0, behavior: "smooth" }) }}>
                                <span className='btn-text'>EXPLORE RENTING</span><span className="arrow-right">→</span>
                            </button>
                        </div>
                    </div>
            }
            <PackagesPlan
                showPackages={showMonth}
                handleClose={() => setShowMonth(false)}
                packages={selectedItemId ? packagesByVariant[selectedItemId] || [] : []}
                selectedPkg={selectedItemId ? rentCart.find(item => item.cartItemId === selectedItemId)?.selectedPackage : null}
                onSelectPackage={(packageData) => {
                    if (selectedItemId) {
                        handlePackageSelect(selectedItemId, packageData);
                        setShowMonth(false);
                    }
                }}
            />
            <DeleteCartItemModal showCartDelete={showCartDelete} handleClose={() => setShowCartDelete(false)} handleMoveToWishlist={handleMoveToWishlist} handleRemoveCart={handleRemoveCart} selectedItem={selectedItem} />
            {!userId && <LoginModal show={loginModal} onHide={() => setLoginModal(false)} onLoginSuccess={handleLoginSuccess} />}
        </>
    )
}

export default Cartpage
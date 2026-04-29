import React, { useEffect, useState } from 'react'
import { TbTruckDelivery } from 'react-icons/tb'
import { FaArrowRight, FaRegClock } from 'react-icons/fa6'
import Header from '../header/Header'
import "../CartPage/cartpage.css"
import "./checkout-coupon.css"
import { useDispatch, useSelector } from 'react-redux'
import { FiTrash2 } from 'react-icons/fi'
import { addToBuyCart, addToRentCart, decreaseBuyQty, decreaseRentQty, removeFromBuyCart, removeFromRentCart, setRentalPackage } from '../../redux/cartSlice'
import { useNavigate } from 'react-router-dom'
import { BiCheckCircle, BiChevronDown, BiChevronUp } from 'react-icons/bi'
import axiosConfig from "../../Services/axiosConfig"
import { IoArrowForward } from 'react-icons/io5'
import LoginModal from '../Login/Login'
import { toast } from 'react-toastify'
import MonthOffcanvas from '../CartPage/MonthCanva'
import CheckoutNavbar from '../CheckoutNavbar/CheckoutNavbar'
import DeleteCartItemModal from '../CartPage/DeleteCartItemModal'
import PackagesPlan from '../CartPage/Packages'
import CouponOffcanvas from './CouponOffCanva'

function Checkout() {
    const { buyCart, rentCart } = useSelector(store => store.cart)
    const [deliveryType, setDeliveryType] = useState("company-transport")
    const [loginModal, setLoginModal] = useState(false)
    const [userId, setUserId] = useState(localStorage.getItem("userid"))
    const [orderData, setOrderData] = useState([])
    const [priceBreakup, setPriceBreakup] = useState(null)
    const [rentalToggle, setRentalToggle] = useState(true)
    const [saleToggle, setSaleToggle] = useState(true)
    const [loading, setLoading] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null)
    const [showPackages, setShowPackages] = useState(false);
    const [packagesData, setPackagesData] = useState([]);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [selectedCartItemId, setSelectedCartItemId] = useState(null);
    const [saleCouponLoading, setSaleCouponLoading] = useState(false)
    const [saleCoupon, setSaleCoupon] = useState([]);
    const [rentCouponLoading, setRentcouponLoading] = useState(false)
    const [offerCanva, setOfferCanva] = useState(false);
    const [couponType, setCouponType] = useState(""); // sale or rental
    const [rentCoupon, setRentCoupon] = useState([])
    const [saleCouponApplied, setSaleCouponApplied] = useState([]);
    const [rentCouponApplied, setRentCouponApplied] = useState([])
    const appliedSaleCoupon = saleCouponApplied[0]?.coupon_applied || null;
    const appliedRentCoupon = rentCouponApplied[0]?.coupon_applied || null;
    const dispatch = useDispatch();
    let navigate = useNavigate()
    async function fetchExistingOrderData() {
        setLoading(true);
        try {
            const res = await axiosConfig(`/accounts/orderdetails/?order=${localStorage.getItem("orderId")}`);
            setOrderData(res?.data?.results);
            if (res?.data?.results[0]?.order?.coupon_code &&
                res.data.results[0].order.coupon_code.length > 0) {

                const coupons = res.data.results[0].order.coupon_code;

                // Separate coupons by type
                const saleCoupons = coupons.filter(coupon => coupon.coupon_type === "sale");
                const rentCoupons = coupons.filter(coupon => coupon.coupon_type === "rental");

                setSaleCouponApplied(saleCoupons);
                setRentCouponApplied(rentCoupons);
                syncCartWithOrderData(res?.data?.results);
            } else {
                setSaleCouponApplied([])
                setRentCouponApplied([])
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    async function getSaleCoupon() {
        setSaleCouponLoading(true)
        try {
            const res = await axiosConfig("/catlog/coupons/?coupon_type=sale&is_suspended=false");
            setSaleCoupon(res?.data?.results)
        } catch (error) {
            console.log(error)
        } finally {
            setSaleCouponLoading(false)
        }
    }
    async function getRentCoupon() {
        setRentcouponLoading(true)
        try {
            const res = await axiosConfig("/catlog/coupons/?coupon_type=rental&is_suspended=false");
            setRentCoupon(res?.data?.results)
        } catch (error) {
            console.log(error)
        } finally {
            setRentcouponLoading(false)
        }
    }
    useEffect(() => {
        fetchExistingOrderData();
        getSaleCoupon()
        getRentCoupon()
    }, []);
    const fetchPackagesForVariant = async (variantId) => {
        try {
            const res = await axiosConfig(`/catlog/variant-price-packages/?product_variant=${variantId}&active=true`);
            setPackagesData(res?.data?.results || []);
        } catch (error) {
            console.log("Error fetching packages:", error);
            setPackagesData([]);
        }
    };

    useEffect(() => {
        if (buyCart.length === 0 && rentCart.length === 0) {
            navigate("/cart");
        }
    }, [buyCart, rentCart, navigate]);


    const formatPrice = (price) => {
        if (!price && price !== 0) return "$ 0";

        const formatted = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price);
        return `$ ${formatted}`;
    };

    const rentalDeliveryCharge = priceBreakup?.find(
        item => item.cart_type === "rent"
    )?.delivery_charges || 0;
    const buyDeliveryCharge = priceBreakup?.find(
        item => item.cart_type === "buy"
    )?.delivery_charges || 0;
    const rentalBaseTotal = Number(orderData[0]?.order?.rental_total_amount || 0);
    const buyBaseTotal = Number(orderData[0]?.order?.sale_total_amount || 0);

    const rentalTotal =
        rentalBaseTotal +
        (deliveryType === "company-transport" ? rentalDeliveryCharge : 0);

    const buyTotal =
        buyBaseTotal +
        (deliveryType === "company-transport" ? buyDeliveryCharge : 0);

    async function postPpriceBreakup() {
        // Use localStorage to get the most current cart data
        const latestBuyCart = JSON.parse(localStorage.getItem("buyCart")) || [];
        const latestRentCart = JSON.parse(localStorage.getItem("rentCart")) || [];

        const totalBuyQty = latestBuyCart.reduce((total, item) => total + (item?.qty || 0), 0);
        const totalRentQty = latestRentCart.reduce((total, item) => total + (item?.qty || 0), 0);

        const payload = {
            items: [
                ...(totalBuyQty > 0 ? [{
                    cart_type: "buy",
                    quantity: totalBuyQty,
                    sale_address_id: saleAddress?.id
                }] : []),
                ...(totalRentQty > 0 ? [{
                    cart_type: "rent",
                    quantity: totalRentQty,
                    rental_address_id: rentalAddress?.id
                }] : [])
            ]
        }
        try {
            const res = await axiosConfig.post(`/accounts/deliverycharges/`, payload)
            setPriceBreakup(res?.data?.details)
            console.log(res)
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        postPpriceBreakup()
    }, [deliveryType])
    console.log(priceBreakup, "ppppp")
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
    const unifiedAddress = saleAddress || rentalAddress;
    async function proceedToCheckout() {
        if (!unifiedAddress && (buyCart.length > 0 || rentCart.length > 0)) {
            toast.error("Please select a delivery address");
            navigate('/address', { state: { addressType: 'both' } });
            return;
        }

        const buyAddressId = buyCart.length > 0 ? unifiedAddress?.id : ""
        const rentAddressId = rentCart.length > 0 ? unifiedAddress?.id : ""

        // Use createOrderPayload() helper you already created
        const payload = createOrderPayload();
        payload.delivery_mode = deliveryType;
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

    const handlePackageSelect = (packageData) => {
        if (selectedCartItemId) {
            // Update Redux
            dispatch(setRentalPackage({
                cartItemId: selectedCartItemId,
                packageData: packageData
            }));

            // Update localStorage
            const rentCart = JSON.parse(localStorage.getItem("rentCart")) || [];
            const updatedCart = rentCart.map(item =>
                item.cartItemId === selectedCartItemId
                    ? { ...item, selectedPackage: packageData }
                    : item
            );
            localStorage.setItem("rentCart", JSON.stringify(updatedCart));

            // Update backend
            updateBackendWithPackage(selectedCartItemId, packageData);

            // Close the packages modal
            setShowPackages(false);
        }
    };
    const updateBackendWithPackage = async (cartItemId, packageData) => {
        try {
            const orderId = localStorage.getItem("orderId");
            if (!orderId) return;

            const payload = createOrderPayload();
            await axiosConfig.patch(`/accounts/orders/${orderId}/`, payload);

            // Refresh order data
            const orderRes = await axiosConfig(`/accounts/orderdetails/?order=${orderId}`);
            setOrderData(orderRes?.data?.results || []);

            toast.success("Package updated successfully!");
        } catch (err) {
            console.error("Error updating package:", err);
            toast.error("Failed to update package");
        }
    };

    const handleRentQtyUpdate = async (item, type) => {
        try {
            const uniqueId = item?.unique_id;
            const rentCart = JSON.parse(localStorage.getItem("rentCart")) || [];
            const cartItem = rentCart.find(ele => ele.cartItemId === uniqueId);

            if (!cartItem) return;

            // If decreasing and quantity is 1, REMOVE THE ITEM
            if (type === "decrease" && cartItem.qty === 1) {
                // Remove from Redux
                dispatch(removeFromRentCart(uniqueId));

                // Remove from localStorage
                const filteredCart = rentCart.filter(ele => ele.cartItemId !== uniqueId);
                localStorage.setItem("rentCart", JSON.stringify(filteredCart));

                // Show message
                toast.success("Item removed from cart");

                // Update backend
                const orderId = localStorage.getItem("orderId");
                if (orderId) {
                    const buyCart = JSON.parse(localStorage.getItem("buyCart")) || [];

                    const payload = {
                        sale_addresses: saleAddress?.id || "",
                        rental_addresses: rentalAddress?.id || "",
                        order_details: [
                            ...buyCart.map(ele => ({
                                variant: ele.id,
                                item_type: "sale",
                                quantity: ele.qty
                            })),
                            ...filteredCart.map(ele => ({
                                variant: ele.id,
                                quantity: ele.qty,
                                item_type: "rental",
                                rental_start_date: ele.fromDate,
                                rental_end_date: ele.toDate,
                                package_name: ele.selectedPackage?.package_name,
                                duration_value: ele.selectedPackage?.duration_value,
                                unique_id: ele.cartItemId
                            }))
                        ]
                    };
                    await axiosConfig.patch(`/accounts/orders/${orderId}/`, payload);
                }

                // Refresh data
                const orderRes = await axiosConfig(`/accounts/orderdetails/?order=${localStorage.getItem("orderId")}`);
                setOrderData(orderRes?.data?.results || []);

                return; // STOP HERE - item is removed
            }

            // Regular quantity update (increase or decrease when qty > 1)
            const updatedCart = rentCart.map(ele => {
                if (ele.cartItemId === uniqueId) {
                    const newQty = type === "increase"
                        ? ele.qty + 1
                        : ele.qty - 1;
                    return { ...ele, qty: newQty };
                }
                return ele;
            });

            // Update localStorage
            localStorage.setItem("rentCart", JSON.stringify(updatedCart));

            // Update Redux
            if (type === "increase") {
                dispatch(addToRentCart(cartItem));
            } else {
                dispatch(decreaseRentQty(cartItem.cartItemId));
            }

            // Update backend
            const orderId = localStorage.getItem("orderId");
            if (orderId) {
                const buyCart = JSON.parse(localStorage.getItem("buyCart")) || [];

                const payload = {
                    sale_addresses: saleAddress?.id || "",
                    rental_addresses: rentalAddress?.id || "",
                    order_details: [
                        ...buyCart.map(ele => ({
                            variant: ele.id,
                            item_type: "sale",
                            quantity: ele.qty
                        })),
                        ...updatedCart.map(ele => ({
                            variant: ele.id,
                            quantity: ele.qty,
                            item_type: "rental",
                            rental_start_date: ele.fromDate,
                            rental_end_date: ele.toDate,
                            package_name: ele.selectedPackage?.package_name,
                            duration_value: ele.selectedPackage?.duration_value,
                            unique_id: ele.cartItemId
                        }))
                    ]
                };
                await axiosConfig.patch(`/accounts/orders/${orderId}/`, payload);
            }

            // Refresh data
            const orderRes = await axiosConfig(`/accounts/orderdetails/?order=${localStorage.getItem("orderId")}`);
            setOrderData(orderRes?.data?.results || []);

            await postPpriceBreakup();

        } catch (err) {
            console.error("Update error:", err);
            toast.error("Failed to update quantity");
        }
    }
    useEffect(() => {
        // Check if both carts are empty
        const buyCart = JSON.parse(localStorage.getItem("buyCart")) || [];
        const rentCart = JSON.parse(localStorage.getItem("rentCart")) || [];

        if (buyCart.length === 0 && rentCart.length === 0) {
            setTimeout(() => {
                navigate("/cart");
            }, 1000);
        }
    }, [buyCart, rentCart, navigate]);
    const addToWishList = async (item) => {
        const payload = {
            user: userId,
            varient: item?.id,
            type: item?.type === "sale" ? "sale" : "rental" // Make sure this matches
        }
        try {
            await axiosConfig.post(`/catlog/wishlists/`, payload)
            toast.success("Item moved to wishlist!");
        } catch (error) {
            console.log(error)
            toast.error("Failed to move to wishlist");
        }
    }
    const handleMoveToWishlist = async (selectedItem) => {
        if (!selectedItem) return;

        await addToWishList(selectedItem);

        // Remove from correct cart based on type
        if (selectedItem.type === "sale") {
            dispatch(removeFromBuyCart(selectedItem.id));
            const buyCart = JSON.parse(localStorage.getItem("buyCart")) || [];
            const updatedBuyCart = buyCart.filter(e => e.id !== selectedItem.id);
            localStorage.setItem("buyCart", JSON.stringify(updatedBuyCart));
        } else if (selectedItem.type === "rental" || selectedItem.type === "rent") {
            // For rent items, use uniqueId if available, otherwise use id
            const identifier = selectedItem.uniqueId || selectedItem.id;
            dispatch(removeFromRentCart(identifier));
            const rentCart = JSON.parse(localStorage.getItem("rentCart")) || [];
            const updatedRentCart = rentCart.filter(e =>
                selectedItem.uniqueId ? e.cartItemId !== selectedItem.uniqueId : e.id !== selectedItem.id
            );
            localStorage.setItem("rentCart", JSON.stringify(updatedRentCart));
        }

        setShowDeleteModal(false);

        // Update backend and refresh data
        await handleDeleteItem(selectedItem.id, selectedItem.type, selectedItem.uniqueId);
    }
    const createOrderPayload = () => {
        const buyCart = JSON.parse(localStorage.getItem("buyCart")) || [];
        const rentCart = JSON.parse(localStorage.getItem("rentCart")) || [];

        return {
            sale_addresses: buyCart.length > 0 ? saleAddress?.id || "" : "",
            rental_addresses: rentCart.length > 0 ? rentalAddress?.id || "" : "",
            order_details: [
                ...buyCart.map(ele => ({
                    variant: ele.id,
                    item_type: "sale",
                    quantity: ele.qty
                })),
                ...rentCart.map(ele => ({
                    variant: ele.id,
                    quantity: ele.qty,
                    item_type: "rental",
                    rental_start_date: ele.fromDate,
                    rental_end_date: ele.toDate,
                    package_name: ele.selectedPackage?.package_name,
                    duration_value: ele.selectedPackage?.duration_value,
                    unique_id: ele.cartItemId
                }))
            ]
        };
    };
    const syncCartWithOrderData = (orderDetails) => {
        if (!orderDetails || !Array.isArray(orderDetails)) return;

        // For each rental item in order data
        orderDetails.forEach(orderItem => {
            if (orderItem.item_type === "rental") {
                // Find matching item in rentCart
                const rentCart = JSON.parse(localStorage.getItem("rentCart")) || [];
                const cartItem = rentCart.find(item =>
                    item.cartItemId === orderItem.unique_id
                );

                if (cartItem && orderItem.package) {
                    // Update selectedPackage in cart
                    cartItem.selectedPackage = {
                        package_name: orderItem.package,
                        duration_value: orderItem.rental_duration,
                        offer_price: orderItem.total_price,
                        price: orderItem.price
                    };

                    // Update Redux
                    dispatch(setRentalPackage({
                        cartItemId: cartItem.cartItemId,
                        packageData: cartItem.selectedPackage
                    }));
                }
            }
        });

        // Save updated cart
        const rentCart = JSON.parse(localStorage.getItem("rentCart")) || [];
        localStorage.setItem("rentCart", JSON.stringify(rentCart));
    };
    async function handleDeleteItem(variantId, type, uniqueId = null) {
        try {
            const orderId = localStorage.getItem("orderId");
            if (!orderId) return;

            if (type === "rental") {
                // For rent items, use uniqueId (cartItemId) if available
                const identifier = uniqueId || variantId;

                // Remove from rent cart
                const rentCart = JSON.parse(localStorage.getItem("rentCart")) || [];
                const updatedRentCart = rentCart.filter(e =>
                    uniqueId ? e.cartItemId !== uniqueId : e.id !== variantId
                );
                localStorage.setItem("rentCart", JSON.stringify(updatedRentCart));

                // Dispatch to Redux using the correct identifier
                dispatch(removeFromRentCart(identifier));
            } else {
                // For buy items, use variantId
                const buyCart = JSON.parse(localStorage.getItem("buyCart")) || [];
                const updatedBuyCart = buyCart.filter(e => e.id !== variantId);
                localStorage.setItem("buyCart", JSON.stringify(updatedBuyCart));
                dispatch(removeFromBuyCart(variantId));
            }

            // Update backend
            const payload = createOrderPayload();
            await axiosConfig.patch(`/accounts/orders/${orderId}/`, payload);

            // Refresh data
            const orderRes = await axiosConfig(`/accounts/orderdetails/?order=${orderId}`);
            setOrderData(orderRes?.data?.results || []);

            await postPpriceBreakup();

            toast.success("Item removed successfully!");

            // Close modal
            setShowDeleteModal(false);

            // Check if cart is now empty
            const currentBuyCart = JSON.parse(localStorage.getItem("buyCart")) || [];
            const currentRentCart = JSON.parse(localStorage.getItem("rentCart")) || [];

            if (currentBuyCart.length === 0 && currentRentCart.length === 0) {
                setTimeout(() => {
                    navigate("/cart");
                }, 1000);
            }
        } catch (err) {
            console.error("Error deleting item:", err);
            toast.error("Failed to remove item");
            setShowDeleteModal(false);
        }
    }

    async function handleBuyQtyUpdate(item, type) {
        try {
            const variantId = item?.varient?.id ?? item?.id;
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

            // 4️⃣ Sync with backend using createOrderPayload()
            const orderId = localStorage.getItem("orderId");
            if (orderId) {
                const payload = createOrderPayload();
                await axiosConfig.patch(`/accounts/orders/${orderId}/`, payload);
            }

            // 5️⃣ Refresh order details
            const res = await axiosConfig(`/accounts/orderdetails/?order=${localStorage.getItem("orderId")}`);
            setOrderData(res?.data?.results || []);
            if (res?.data?.results[0]?.order?.coupon_code) {
                const coupons = res.data.results[0].order.coupon_code;
                const saleCoupons = coupons.filter(coupon => coupon.coupon_type === "sale");
                const rentCoupons = coupons.filter(coupon => coupon.coupon_type === "rental");

                setSaleCouponApplied(saleCoupons);
                setRentCouponApplied(rentCoupons);
            } else {
                setSaleCouponApplied([]);
                setRentCouponApplied([]);
            }

            await postPpriceBreakup();

        } catch (err) {
            console.error("Update error:", err);
            toast.error("Failed to update quantity");
        }
    }
    const handleDeliveryTypeChange = async (type) => {
        try {
            setDeliveryType(type);

            const orderId = localStorage.getItem("orderId");
            if (!orderId) return;

            // Call ORDER API immediately
            const payload = createOrderPayload();
            payload.delivery_mode = type;
            await axiosConfig.patch(
                `/accounts/orders/${orderId}/`,
                payload
            );

            // OPTIONAL: if delivery charges depend on deliveryType
            await postPpriceBreakup();

            // Refresh order details
            const orderRes = await axiosConfig(
                `/accounts/orderdetails/?order=${orderId}`
            );
            setOrderData(orderRes?.data?.results || []);

        } catch (err) {
            console.error("Delivery type update failed", err);
        }
    };
    async function applySaleCoupon(couponCode, couponId) {
        const orderId = localStorage.getItem("orderId")

        if (appliedSaleCoupon === couponId) {
            let payload = {
                order_id: orderId,
                coupon_code: couponCode,
                coupon_type: "sale"
            }
            try {
                await axiosConfig.post("/accounts/orders/remove-coupon/", payload)
                await fetchExistingOrderData()
                toast.success("remove coupon successfully")
            } catch (error) {
                console.log(error)
            }
        } else {
            let payload = {
                order_id: orderId,
                coupon_code: couponCode
            }
            try {
                await axiosConfig.post("/accounts/orders/apply-coupon/", payload);
                await fetchExistingOrderData()
                toast.success("coupon applied successfully")
            } catch (error) {
                toast.error(error.response.data.error[0])
            }
        }
    }
    async function applyRentCoupon(couponCode, couponId) {
        const orderId = localStorage.getItem("orderId")

        if (appliedRentCoupon === couponId) {
            let payload = {
                order_id: orderId,
                coupon_code: couponCode,
                coupon_type: "rental"
            }
            try {
                await axiosConfig.post("/accounts/orders/remove-coupon/", payload)
                await fetchExistingOrderData()
                toast.success("remove coupon successfully")
            } catch (error) {
                console.log(error)
            }
        } else {
            let payload = {
                order_id: orderId,
                coupon_code: couponCode
            }
            try {
                await axiosConfig.post("/accounts/orders/apply-coupon/", payload);
                await fetchExistingOrderData()
                toast.success("coupon applied successfully")
            } catch (error) {
                toast.error(error.response.data.error[0])
            }
        }
    }

    return (
        <>
            <CheckoutNavbar />
            <div className="cart-container">
                <div className="cart-left">
                    {
                        unifiedAddress ? (
                            <div className='cart-delivery-estimate mb-3'>
                                <div className='cart-delivery-estimate-left'>
                                    <div>
                                        <p className='deliver-address'>Delivering to : <span>{unifiedAddress?.name || ""}</span></p>
                                        <p className='delivery-full-add'>
                                            Floor : {unifiedAddress.flat_no}, {unifiedAddress.address_line_1}, {unifiedAddress.address_line_2}, {unifiedAddress.landmark}, {unifiedAddress.city}, {unifiedAddress.state}, {unifiedAddress.country}
                                        </p>
                                    </div>
                                </div>
                                <div className='cart-delivery-estimate-right'>
                                    <button onClick={() => navigate("/address", { state: { addressType: 'both' } })}>change</button>
                                </div>
                            </div>
                        ) : (
                            <div className='cart-delivery-estimate mb-3'>
                                <div className='cart-delivery-estimate-left'>
                                    <p className='delivery-detail'>
                                        Select Delivery Address
                                    </p>
                                </div>
                                <div className='cart-delivery-estimate-right'>
                                    <button onClick={() => navigate("/address", { state: { addressType: 'both' } })}>Choose</button>
                                </div>
                            </div>
                        )
                    }
                    <div className="cart-sticky-sections">
                    {
                        <>
                            {
                                buyCart.length > 0 && (
                                    <>
                                        <div className="cart-section-box">
                                            <div className="cart-section-header">
                                                Buy Cart <span>{buyCart.length} items</span>
                                            </div>
                                            {
                                                orderData.length > 0 ? (
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
                                                                            {Math.round(Number(((item.price - item.offer_price) / item.price)) * 100)}%
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
                                                                    <div className="delete-icon">
                                                                        <FiTrash2 onClick={() => {
                                                                            setShowDeleteModal(true);
                                                                            setSelectedItem({
                                                                                id: item.varient.id,
                                                                                name: item.varient.name,
                                                                                image: item.varient.images[0]?.image?.image,
                                                                                oldPrice: item.price,
                                                                                offerPrice: item.offer_price,
                                                                                type: "sale"
                                                                            });
                                                                        }} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    ))
                                                ) : ""
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
                                <div className="cart-section-box mb-4">
                                    <div className="cart-section-header">
                                        Rent Cart <span>{rentCart.length} items</span>
                                    </div>
                                    {orderData.length > 0 ? (
                                        orderData?.map(item => (
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
                                                            <span className="discount-badge">-{item.discount_percentage} %</span>
                                                            <span className="new-price">{formatPrice(item.offer_price)}</span>
                                                        </div>


                                                    </div>
                                                    <div className="cart-item-actions">
                                                        <div>
                                                            <div
                                                                className="month-container"
                                                                onClick={() => {
                                                                    setSelectedCartItemId(item.unique_id || item.varient.id);
                                                                    fetchPackagesForVariant(item.varient.id);
                                                                    setShowPackages(true);
                                                                    const rentCart = JSON.parse(localStorage.getItem("rentCart")) || [];
                                                                    const cartItem = rentCart.find(cart =>
                                                                        cart.cartItemId === (item.unique_id || item.varient.id)
                                                                    );
                                                                    setSelectedPackage(cartItem?.selectedPackage || null);
                                                                }}
                                                            >
                                                                <div>
                                                                    {item.package ? `${item.rental_duration} ${item.package}` : "Select Package"}
                                                                </div>
                                                                <BiChevronDown className='month-icon' />
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
                                                            <FiTrash2 onClick={() => {
                                                                setShowDeleteModal(true);
                                                                setSelectedItem({
                                                                    id: item.varient.id,
                                                                    name: item.varient.name,
                                                                    image: item.varient.images[0]?.image?.image,
                                                                    oldPrice: item.price,
                                                                    offerPrice: item.total_price,
                                                                    type: "rental",
                                                                    uniqueId: item.unique_id // ADD THIS LINE
                                                                });
                                                            }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        ))
                                    ) : ""}
                                </div>
                            </div>
                        )

                    }
                    </div>
                </div>
                <div className="cart-right">
                    {
                        buyCart.length > 0 && (
                            <div className="coupon-section">
                                <div className="coupon-head">
                                    <div className="coupon-left">
                                        <img
                                            src={require("../Assets/percent-img.png")}
                                            alt="coupon"
                                            className="coupon-percent"
                                        />

                                        <div>
                                            <p className="coupon-title">Sale Offers & Discounts</p>
                                            <p className="coupon-view"
                                                onClick={() => {
                                                    setCouponType("sale");
                                                    setOfferCanva(true);
                                                }}
                                            >View all</p>
                                        </div>
                                    </div>

                                    <div className="coupon-right" onClick={() => { setCouponType("sale"); setOfferCanva(true); }}>
                                        Have a Coupon code?
                                    </div>

                                </div>

                                <div className="coupon-slider">
                                    {saleCoupon?.map((coupon) => (
                                        <div className="coupon-card" key={coupon.id}>
                                            <p className="coupon-offer">
                                                {coupon.description || coupon.offer_text || "Special Offer"} {/* Make sure to show the offer text */}
                                            </p>

                                            <div className={`coupon-ticket ${appliedSaleCoupon === coupon.id ? "applied" : ""}`}>
                                                <span className="coupon-code">
                                                    {coupon.code}
                                                </span>
                                                <button className="coupon-apply" onClick={() => applySaleCoupon(coupon.code, coupon.id)}>
                                                    {appliedSaleCoupon === coupon.id ? "Remove" : "Apply"}
                                                </button>
                                            </div>

                                            <p className="coupon-terms">
                                                *Terms and Conditions
                                            </p>
                                        </div>
                                    ))}
                                </div>

                            </div>
                        )
                    }
                    {
                        rentCart.length > 0 && (
                            <div className="coupon-section">
                                <div className="coupon-head">
                                    <div className="coupon-left">
                                        <img
                                            src={require("../Assets/percent-img.png")}
                                            alt="coupon"
                                            className="coupon-percent"
                                        />

                                        <div>
                                            <p className="coupon-title">Rent Offers & Discounts</p>
                                            <p className="coupon-view" onClick={() => { setCouponType("rental"); setOfferCanva(true); }}>View all</p>
                                        </div>
                                    </div>

                                    <div className="coupon-right" onClick={() => { setCouponType("rental"); setOfferCanva(true); }}>
                                        Have a Coupon code?
                                    </div>

                                </div>

                                <div className="coupon-slider">
                                    {rentCoupon?.map((coupon) => (
                                        <div className="coupon-card" key={coupon.id}>
                                            <p className="coupon-offer">
                                                {coupon.description || coupon.offer_text || "Special Offer"}
                                            </p>

                                            <div className={`coupon-ticket ${appliedRentCoupon === coupon.id ? "applied" : ""}`}>
                                                <span className="coupon-code">
                                                    {coupon.code}
                                                </span>
                                                <button className="coupon-apply" onClick={() => applyRentCoupon(coupon.code, coupon.id)}>
                                                    {appliedRentCoupon === coupon.id ? "Remove" : "Apply"}
                                                </button>
                                            </div>

                                            <p className="coupon-terms">
                                                *Terms and Conditions
                                            </p>
                                        </div>
                                    ))}
                                </div>

                            </div>
                        )
                    }
                    <div className='price-breakup-section'>
                        {
                            orderData.length > 0 && (
                                <>
                                    {
                                        rentCart.length > 0 && (
                                            <div className='breakup-background'>
                                                <div className='break-header'><h4>Rent Cost Breakup</h4><button onClick={() => setRentalToggle(!rentalToggle)}>
                                                    {
                                                        rentalToggle ? "Hide Breakup" : "View Breakup"
                                                    }
                                                    {
                                                        rentalToggle ? <BiChevronUp className='break-icon' size={15} /> : <BiChevronDown className='break-icon' size={15} />
                                                    }
                                                </button>
                                                </div>

                                                <div className={`reantal-toggle ${rentalToggle === true ? "active" : ""}`}>
                                                    {
                                                        orderData.length > 0 &&
                                                        <div className='data-container-parent'>
                                                            {orderData?.map((item) => (
                                                                item.item_type === "rental" && (
                                                                    <div className='data-container' key={item?.id}>
                                                                        <div className='break-item-title'>{item.varient.name} × {item.quantity}</div>
                                                                        <div className="breakup-item">
                                                                            <div>(A) Base Rental Cost</div>
                                                                            <div>{formatPrice(item.varient.prices.rental_price)}/{`${item.package === "Monthly" ? "Month" : "" || item.package === "Daily" ? "Day" : "" || item.package === "Weekly" ? "Week" : ""}`}</div>
                                                                        </div>
                                                                        <div className="breakup-item">
                                                                            <div>(B) Duration</div>
                                                                            <div>{item.rental_duration} {`${item.package === "Monthly" ? "Months" : "" || item.package === "Daily" ? "Days" : "" || item.package === "Weekly" ? "Weeks" : ""}`}</div>
                                                                        </div>
                                                                        <div className="breakup-item">
                                                                            <div>(C) Quantity</div>
                                                                            <div>{item.quantity} Qty</div>
                                                                        </div>
                                                                        <div className="breakup-item">
                                                                            <div>(D) Total Price (A X B X C)</div>
                                                                            <div>{formatPrice(item.varient.prices.rental_price * item.rental_duration * item.quantity)} </div>
                                                                        </div>
                                                                        <div className="breakup-item text-success">
                                                                            <div>(E) Rental Discount</div>
                                                                            <div>-{Math.round(Number(item?.discount_percentage))}%  -{formatPrice(Math.round((item.price * item.quantity) - (item.offer_price * item.quantity)))}</div>
                                                                        </div>
                                                                        <div className="breakup-item">
                                                                            <div>Net Amount</div>
                                                                            <div>{formatPrice(item?.offer_price * item.quantity)}</div>
                                                                        </div>
                                                                        <div className='discount-green'>You Will Save  {formatPrice(Math.round((item.price * item.quantity) - (item.offer_price * item.quantity)))}</div>
                                                                    </div>
                                                                )
                                                            ))}
                                                            {
                                                                deliveryType === "company-transport" && <div className="breakup-item">
                                                                    <div>Delivery Charges</div>
                                                                    <div>
                                                                        {/* {priceBreakup?.map((rb, index) => (
                                                                            rb.cart_type === "rent" && <div key={index}>{formatPrice(rb.delivery_charges)}</div>
                                                                        ))} */}
                                                                        ${rentalDeliveryCharge}
                                                                    </div>
                                                                </div>
                                                            }
                                                            {
                                                                rentCouponApplied && rentCouponApplied.length > 0 && (
                                                                    <div className="breakup-item text-success">
                                                                        <div>Coupon Discount</div>
                                                                        <div>-{formatPrice(rentCouponApplied[0]?.coupon_discount)}</div>
                                                                    </div>
                                                                )
                                                            }
                                                            <div className="breakup-item">
                                                                <div>Rental Total</div>
                                                                <div>{formatPrice(rentalTotal - (rentCouponApplied[0]?.coupon_discount || 0))}</div>
                                                            </div>
                                                        </div>

                                                    }
                                                </div>
                                            </div>
                                        )
                                    }

                                    {
                                        buyCart.length > 0 && (
                                            <div className='breakup-background'>
                                                <div className='break-header'><h4>Buy Cost Breakup</h4><button onClick={() => setSaleToggle(!saleToggle)}>
                                                    {
                                                        saleToggle ? "Hide Breakup" : "View Breakup"
                                                    }
                                                    {
                                                        saleToggle ? <BiChevronUp className='break-icon' size={15} /> : <BiChevronDown className='break-icon' size={15} />
                                                    }
                                                </button>
                                                </div>
                                                <div className={`sale-toggle ${saleToggle === true ? "active" : ""}`}>
                                                    {
                                                        orderData.length > 0 &&
                                                        <div className='data-container-parent'>
                                                            {
                                                                orderData?.map((item) => (
                                                                    item.item_type === "sale" && (
                                                                        <div className='data-container' key={item?.id}>
                                                                            <div className='break-item-title'>{item.varient.name} × {item.quantity}</div>
                                                                            <div className="breakup-item"><div>(A) Base Sale Cost</div><div>{formatPrice(item.price)}</div></div>
                                                                            <div className="breakup-item"><div>(B) Quantity</div><div>{item.quantity} Qty</div></div>
                                                                            <div className="breakup-item"><div>(C) Total Price (A X B)</div><div>${item.price * item.quantity}</div></div>
                                                                            <div className="breakup-item text-success"><div>(D) Sale Discount</div><div>-{Math.round(Number(((item.price - item.offer_price) / item.price)) * 100)}%  -{formatPrice((item.price * item.quantity) - ((item.offer_price * item.quantity)))}</div></div>
                                                                            <div className="breakup-item"><div>(E) Net Price {"   "} (A X B − D)</div><div>{formatPrice(item.offer_price * item.quantity)}</div></div>
                                                                            <div className='discount-green'>You Will Save {formatPrice((item.price * item.quantity) - ((item.offer_price * item.quantity)))}</div>
                                                                        </div>
                                                                    )
                                                                ))
                                                            }
                                                            {
                                                                deliveryType === "company-transport" && <div className="breakup-item">
                                                                    <div>Delivery Charges</div>
                                                                    <div>
                                                                        ${buyDeliveryCharge}
                                                                    </div>
                                                                </div>
                                                            }
                                                            {
                                                                saleCouponApplied && saleCouponApplied.length > 0 && (
                                                                    <div className="breakup-item text-success">
                                                                        <div>Coupon Discount</div>
                                                                        <div>-{formatPrice(saleCouponApplied[0]?.coupon_discount)}</div>
                                                                    </div>
                                                                )
                                                            }
                                                            <div className="breakup-item">
                                                                <div>Sale Total</div>
                                                                <div>
                                                                    {formatPrice(buyTotal - (saleCouponApplied[0]?.coupon_discount || 0))}
                                                                </div>
                                                            </div>
                                                        </div>

                                                    }

                                                </div>
                                            </div>
                                        )
                                    }
                                </>

                            )
                        }
                    </div>
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
                            <div><button className={`transpport-btn ${deliveryType === "company-transport" ? "active" : ""}`} onClick={() => handleDeliveryTypeChange("company-transport")}>Company Transport</button></div>
                            <div><button className={`transpport-btn ${deliveryType === "self-transport" ? "active" : ""}`} onClick={() => handleDeliveryTypeChange("self-transport")}>Self Transport</button></div>
                        </div>
                        <div className='cart-btn mt-3' onClick={proceedToCheckout}>
                            <div>{formatPrice(orderData[0]?.order?.net_amount)}</div>
                            <div>
                                PROCEED <IoArrowForward size={17} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <PackagesPlan
                showPackages={showPackages}
                handleClose={() => setShowPackages(false)}
                packages={packagesData}
                selectedPkg={selectedPackage}
                onSelectPackage={handlePackageSelect}
            />
            <DeleteCartItemModal
                showCartDelete={showDeleteModal}
                handleClose={() => setShowDeleteModal(false)}
                handleMoveToWishlist={() => {
                    if (selectedItem) {
                        handleMoveToWishlist(selectedItem);
                    }
                }}
                handleRemoveCart={() => {
                    if (selectedItem) {
                        handleDeleteItem(selectedItem.id, selectedItem.type, selectedItem.uniqueId);
                    }
                }}
                selectedItem={selectedItem}
            />
            <CouponOffcanvas
                show={offerCanva}
                handleClose={() => setOfferCanva(false)}
                couponType={couponType}
                saleCoupon={saleCoupon}
                rentCoupon={rentCoupon}
                applySaleCoupon={applySaleCoupon}
                applyRentCoupon={applyRentCoupon}
                appliedSaleCoupon={appliedSaleCoupon}
                appliedRentCoupon={appliedRentCoupon}
                refreshCoupons={fetchExistingOrderData}
            />
            {!userId && <LoginModal show={loginModal} onHide={() => setLoginModal(false)} onLoginSuccess={handleLoginSuccess} />}
        </>
    )
}

export default Checkout

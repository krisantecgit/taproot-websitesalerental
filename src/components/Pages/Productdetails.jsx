import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import "./productdetails.css";
import Header from '../header/Header';
import { IoArrowBack, IoArrowForward } from "react-icons/io5";
import { FaSearchPlus } from 'react-icons/fa';
import axiosConfig from "../../Services/axiosConfig"
import RelatedProducts from './RelatedProducts';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useDispatch } from 'react-redux';
import { addToBuyCart, addToRentCart, } from '../../redux/cartSlice';
import { toast } from 'react-toastify';
function Productdetails() {
    const { state } = useLocation();
    const dispatch = useDispatch();
    const { friendlyurl } = useParams();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [product, setProduct] = useState({});
    const [productDetails, setProductDetails] = useState()
    const [isZoomed, setIsZoomed] = useState(false)
    const [listingType, setListingType] = useState('');
    const [selectedOption, setSelectedOption] = useState('');
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [error, setError] = useState("")

    let navigate = useNavigate()
    const formatPrice = (price) =>
        price?.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).replace("$", "$ ");
    useEffect(() => {
        if (state?.listingType) {
            setListingType(state.listingType);
            if (state.listingType === 'buy') {
                setSelectedOption('buy');
            } else if (state.listingType === 'rent') {
                setSelectedOption('rent');
            } else if (state.listingType === 'buy/rent') {
                setSelectedOption('buy')
            }

        }
    }, [state]);
    useEffect(() => {
        async function fetchFullProduct() {
            const res = await axiosConfig.get(`/catlog/seo-url/${friendlyurl}`);
            setProduct(res.data.product_data);
        }
        async function fetchProductDetails() {
            try {
                const res = await axiosConfig.get(`/catlog/product-variant-detail/${state?.item?.id}`);
                setProductDetails(res.data)
            } catch (error) {
                console.log(error)
            }
        }
        fetchFullProduct();
        fetchProductDetails()
    }, [friendlyurl, state?.item?.id]);
    const images = productDetails?.images.map((img) => img.image) || [];
    useEffect(() => {
        if (state?.item?.name) {
            document.title = product.name;
        }
    }, [state?.item?.name]);

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };
    function handleListingSwitch(type) {
        setError("")
        const urlType = type === "buy" ? "buy" : "rent";
        navigate(`/product/${friendlyurl}`, {
            state: { item: state?.item, listingType: urlType },
        });
    }
    function formatLocalDate(date) {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

    function handleAddToCart(type, productData) {
        if (type === "rent") {
            if (!fromDate || !toDate) {
                setError("Please choose start and end dates before adding to cart.")
                setTimeout(() => {
                    setError("")
                }, 3000)
                return;
            }
            dispatch(addToRentCart({
                ...productData, fromDate : formatLocalDate(fromDate), toDate : formatLocalDate(toDate)
            }))
            toast.success("Product added to cart")
        } else {
            dispatch(addToBuyCart(productData))
            toast.success("Product added to cart")
        }
    }
    return (
        <div>
            <Header />
            <div className="product-details">
                <div className="product-left">
                    <div className="image-slider">
                        {images.length > 0 && (
                            <>
                                <div className="main-image-wrapper">
                                    <img
                                        src={images[currentIndex].image}
                                        alt="Product" className="main-image" />
                                    <div className="zoom-container">
                                        <FaSearchPlus
                                            className="search-plus"
                                            onMouseEnter={() => setIsZoomed(true)}
                                            onMouseLeave={() => setIsZoomed(false)}
                                        />
                                        {isZoomed && (
                                            <div
                                                className="zoom-preview"
                                                onMouseEnter={() => setIsZoomed(true)}
                                                onMouseLeave={() => setIsZoomed(false)}
                                            >
                                                <img
                                                    src={images[currentIndex]?.image}
                                                    alt="Zoomed Product"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="next-image-wrapper">
                                    <img
                                        src={images[(currentIndex + 1) % images.length].image}
                                        alt="Next"
                                        className="next-image"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <button className="arrow left" onClick={handlePrev}>
                        <IoArrowBack />
                    </button>
                    <button className="arrow right" onClick={handleNext}>
                        <IoArrowForward />
                    </button>

                    <div className="thumbnail-section">
                        {images.map((img, index) => (
                            <img
                                key={index}
                                src={img.image}
                                alt={`Thumbnail ${index}`}
                                className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
                                onClick={() => setCurrentIndex(index)}
                            />
                        ))}
                    </div>
                    <div className="product-name">{productDetails?.name}</div>
                    <div dangerouslySetInnerHTML={{ __html: product.description }}></div>
                </div>

                <div className="product-right">
                    <div className='product-right-listingtype'>{productDetails?.varient_listing_type}</div>
                    <div className='product-right-title'>{productDetails?.name}</div>
                    <div className="radio-group">
                        {productDetails?.varient_listing_type && (
                            <>
                                {(() => {
                                    const currentType = selectedOption;
                                    const type = productDetails.varient_listing_type; // buy / rent / buy/rent

                                    const showBuy = type === "buy" || type === "buy/rent";
                                    const showRent = type === "rent" || type === "buy/rent";

                                    // order depends on current type (Rent first if selected)
                                    const options =
                                        currentType === "rent"
                                            ? [{ key: "rent" }, { key: "buy" }]
                                            : [{ key: "buy" }, { key: "rent" }];

                                    return (
                                        <>
                                            {options.map(({ key }) => {
                                                if ((key === "buy" && showBuy) || (key === "rent" && showRent)) {
                                                    const price =
                                                        key === "buy"
                                                            ? productDetails.prices?.sale_offer_price
                                                            : productDetails.prices?.rental_price;
                                                    const oldPrice =
                                                        key === "buy" ? productDetails.prices?.sale_price : null;

                                                    const isActive = currentType === key;

                                                    return (
                                                        <div key={key}>
                                                            <div
                                                                className="d-flex justify-content-between mt-3"
                                                                onClick={() => {
                                                                    if (currentType !== key) handleListingSwitch(key);
                                                                }}
                                                            >
                                                                <div className="single-option">
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        width="14"
                                                                        height="14"
                                                                        viewBox="0 0 24 24"
                                                                        fill="none"
                                                                        stroke={isActive ? "#069baa" : "#535252ff"}
                                                                        strokeWidth="2"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                    >
                                                                        <circle cx="12" cy="12" r="10" />
                                                                        {isActive && <circle cx="12" cy="12" r="5" fill="#069baa" />}
                                                                    </svg>
                                                                    <label className="ms-1" style={{ cursor: "pointer" }}>
                                                                        {key === "buy" ? "Buy" : "Rent"}
                                                                    </label>
                                                                </div>

                                                                {key === "rent" && (
                                                                    <div className="option-price" style={{ fontWeight: 600 }}>
                                                                        {formatPrice(price)}
                                                                        <span style={{ fontSize: "14px", marginLeft: "4px" }}>/Day</span>
                                                                    </div>
                                                                )}

                                                                {key === "buy" && oldPrice && (
                                                                    <div className="product-details-offer-price">
                                                                        <span className="product-old-price-right">{formatPrice(oldPrice)}</span>
                                                                        <span className="product-discount-right">
                                                                            {oldPrice && price
                                                                                ? `${Math.round(((oldPrice - price) / oldPrice) * 100)}% OFF`
                                                                                : ""}
                                                                        </span>
                                                                    </div>
                                                                )}

                                                            </div>
                                                            {key === "rent" && currentType === "rent" && (
                                                                <div className="rent-date-section mt-2">
                                                                    <div className="date-picker-row">
                                                                        <div className="date-field">
                                                                            <label>From:</label>
                                                                            <DatePicker
                                                                                selected={fromDate}
                                                                                onChange={(date) => setFromDate(date)}
                                                                                dateFormat="dd/MM/yyyy"
                                                                                placeholderText="Select start date"
                                                                                minDate={new Date()}
                                                                                className="custom-date-input"
                                                                                popperPlacement="bottom-start"
                                                                            />
                                                                        </div>
                                                                        <div className="date-field">
                                                                            <label>To:</label>
                                                                            <DatePicker
                                                                                selected={toDate}
                                                                                onChange={(date) => setToDate(date)}
                                                                                dateFormat="dd/MM/yyyy"
                                                                                placeholderText="Select end date"
                                                                                minDate={fromDate || new Date()}
                                                                                className="custom-date-input"
                                                                                popperPlacement="bottom-start"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {isActive && (
                                                                <div className='cart-btn-section mt-3'>
                                                                    <div className="cart-btn mt-3" onClick={() =>
                                                                        handleAddToCart(key, {
                                                                            id: productDetails?.id,
                                                                            name: productDetails?.name,
                                                                            friendlyurl: friendlyurl,
                                                                            type: key,
                                                                            image: images?.[0]?.image,
                                                                            oldPrice: key === "buy" ? productDetails?.prices?.sale_price : null,
                                                                            offerPrice:
                                                                                key === "buy"
                                                                                    ? productDetails?.prices?.sale_offer_price
                                                                                    : productDetails?.prices?.rental_price,

                                                                            rentPerDay: key === "rent" ? productDetails?.prices?.rental_price : null,
                                                                        })
                                                                    }
                                                                    >
                                                                        <div>
                                                                            {formatPrice(price)}
                                                                            {key === "rent" && <span style={{ fontSize: "14px", marginLeft: "4px" }}>/Day</span>}
                                                                        </div>
                                                                        <div>
                                                                            ADD TO CART <IoArrowForward size={17} />
                                                                        </div>
                                                                    </div>
                                                                    {
                                                                        error && (
                                                                            <span className='text-danger text-sm'>{error}</span>
                                                                        )
                                                                    }
                                                                </div>
                                                            )}

                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })}
                                        </>
                                    );
                                })()}

                            </>
                        )}
                    </div>



                </div>
            </div>
            <RelatedProducts productId={product?.id} />
        </div>
    );
}

export default Productdetails;
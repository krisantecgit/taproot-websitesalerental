import React, { useEffect, useState } from 'react'
import { Offcanvas } from 'react-bootstrap'
import "./deleteconfirm.css"
import { useDispatch } from 'react-redux';
import LoginModal from '../Login/Login';
function DeleteCartItemModal({ showCartDelete, handleClose, handleMoveToWishlist, handleRemoveCart, selectedItem }) {
    const [loginModal, setLoginModal] = useState(false)
    const [userId, setUserId] = useState(localStorage.getItem("userid"))
    const formatPrice = (price) =>
        price?.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
        }).replace("$", "$ ");
    function handleLoginSuccess(newUserId) {
        setUserId(newUserId);
        setLoginModal(false);
    }
    useEffect(() => {
        const id = localStorage.getItem("userid");
        setUserId(id);
    }, [loginModal]);
    return (
        <div>
            <div>
                <Offcanvas show={showCartDelete} onHide={handleClose} placement="end" className="del-body">
                    <Offcanvas.Header closeButton>
                        <Offcanvas.Title className='canva-title'>Remove item from Cart</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                        <h3 className='deletecart-title'>Are you sure you want to remove this product from the cart?</h3>
                        <div className="deletecart-item-container">
                            <div>
                                <div className='deletecart-image'><img src={selectedItem?.image} /></div>
                            </div>
                            <div className='deletecart-detail'>
                                <div className='deletecart-item-name'>{selectedItem?.name}</div>
                                <div >
                                    <span className='old-price'>{formatPrice(selectedItem?.oldPrice)}</span>
                                    <span className="discount-badge">
                                        -{Math.round(((selectedItem?.oldPrice - selectedItem?.offerPrice) / selectedItem?.oldPrice) * 100)}%
                                    </span>
                                    <span className='new-price'>{formatPrice(selectedItem?.offerPrice)}</span>
                                </div>
                            </div>
                        </div>
                        <div className='deletecart-button-container'>
                            <button className="deletecart-button" onClick={() => handleRemoveCart(selectedItem)}>
                                Remove From Cart
                            </button>
                            {
                                userId ? <button className="deletecart-button" onClick={() => handleMoveToWishlist(selectedItem)}>
                                    Move To Wishlist
                                </button> :
                                    <button className="deletecart-button" onClick={() => setLoginModal(true)}>
                                        Move To Wishlist
                                    </button>
                            }
                        </div>
                    </Offcanvas.Body>
                </Offcanvas>
            </div>
            <LoginModal show={loginModal} onHide={() => setLoginModal(false)} onLoginSuccess={handleLoginSuccess} />
        </div>
    )
}

export default DeleteCartItemModal
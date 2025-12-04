import React, { useState } from "react";
import Offcanvas from "react-bootstrap/Offcanvas";
import OffersSection from "../offersection/Offersection";
import percentImg from "../Assets/percent-img.png";
import useHomepageData from "../../Hook/useHomepageData";
import "./couponcanva.css"
import { IoMdCopy } from "react-icons/io";
import { toast } from "react-toastify";

function OfferCanva({ offerCanva, handleClose, data}) {
    function handleCopyCode(code) {
        navigator.clipboard.writeText(code)
        toast.success("Code copied")
    }
  return (
    <>

      {/* RIGHT SIDE OFFCANVAS */}
      <Offcanvas
        show={offerCanva}
        onHide={handleClose}
        placement="end"
        className="coupon-offcanvas"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className="coupon-title">
            Offers and Discounts
          </Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body>
          {data.map((item, i) => (
            <div key={i} className="coupon-offcanvas-card">

              <div className="row-head">
                <img src={percentImg} height={22} />
                {item.code}
              </div>

              <p className="desc">{item.description}</p>

              <div className="footer-row">
                <p className="code">Coupon code: <b>{item.code}</b></p>
                <button className="copy-btn" onClick={()=>handleCopyCode(item.code)}><IoMdCopy size={20} /> Copy Code</button>
              </div>

            </div>
          ))}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default OfferCanva;

import React, { useEffect, useState } from 'react';
import axiosConfig from "../../Services/axiosConfig.js";
import { Offcanvas } from 'react-bootstrap';
import "./packageplans.css"

function PackagesPlans({ showPackages, handleClose, packages = [], selectedPkg, onSelectPackage }) {
    return (
        <div className="month-wrapper">
            <Offcanvas show={showPackages} onHide={handleClose} placement="end">
                <Offcanvas.Body>
                    {packages.map(pkg => {
                        const isSelected = selectedPkg && selectedPkg.id === pkg.id;

                        return (
                            <div
                                key={pkg.id}
                                className={`pkg-card ${isSelected ? "pkg-active" : ""}`}
                                onClick={() => onSelectPackage(pkg)}
                            >
                                <div>
                                    <div className="pkg-discount">-{pkg.discount_percent}%</div>
                                    <p className="pkg-duration">{pkg.duration_value} Months</p>
                                    <p className="pkg-price">₹{pkg.offer_price}/mo</p>
                                    <p className="pkg-old-price">₹{pkg.price}/mo</p>
                                </div>
                                <div>
                                    <button className={`pkg-btn ${isSelected ? "selected" : ""}`}>
                                        {isSelected ? "SELECTED" : "SELECT"}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </Offcanvas.Body>
            </Offcanvas>
        </div>
    );
}


export default PackagesPlans;

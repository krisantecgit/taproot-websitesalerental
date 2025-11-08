import React, { useEffect, useState } from "react";

import DatePicker from "react-datepicker";
import "./monthofcanvas.css";
import { Offcanvas } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { setRentDates } from "../../redux/cartSlice";
function MonthOffcanvas({ showMonth, handleClose, selectedItemId }) {
    const { rentCart } = useSelector(item => item.cart)
    const currentItem = rentCart.find(item => item.id === selectedItemId)
    const dispatch = useDispatch()
    const [fromDate, setFromDate] = useState(currentItem?.fromDate || null);
    const [toDate, setToDate] = useState(currentItem?.toDate || null);
    useEffect(() => {
        if (currentItem) {
            setFromDate(currentItem.fromDate || null)
            setToDate(currentItem.toDate || null)
        }
    }, [currentItem])
    function handleConfirm() {
        dispatch(
            setRentDates({
                id: selectedItemId,
                fromDate: fromDate
                    ? (fromDate instanceof Date
                        ? fromDate.toISOString().split("T")[0]
                        : fromDate)
                    : null,
                toDate: toDate
                    ? (toDate instanceof Date
                        ? toDate.toISOString().split("T")[0]
                        : toDate)
                    : null,
            })
        );
        handleClose();
    }

    return (
        <div className="month-wrapper">
            <Offcanvas show={showMonth} onHide={handleClose} placement="end">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Select Start Date</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
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
                    <button className="confirm-btn-month" onClick={handleConfirm}>
                        Confirm
                    </button>
                </Offcanvas.Body>
            </Offcanvas>
        </div>
    );
}

export default MonthOffcanvas;

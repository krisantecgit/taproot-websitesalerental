import React, { useState, useEffect, useRef } from "react";
import { FiSearch } from "react-icons/fi";
import { TbTruckDelivery } from "react-icons/tb";
import "./address.css";
import { IoLocationOutline } from "react-icons/io5";
import axiosConfig from "../../Services/axiosConfig"
import { toast } from "react-toastify";

const API_KEY = "AIzaSyDD8frd15FoMhemosVqGvVBCHaRjLgNszc";

export default function AddressPage() {
    const userId = localStorage.getItem("userid")
    const [step, setStep] = useState("default");
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [selected, setSelected] = useState(null);
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const inputRef = useRef();
    const [formData, setFormData] = useState({
        name: "",
        address_line_1: "",
        address_line_2: "",
        flat_no: "",
        landmark: "",
        zipcode: "",
        latitude: "",
        longitude: "",
        mobileno: "",
        country: "",
        state: "",
        city: "",
        user : userId
    })
    useEffect(() => {
        if (window.google) return setScriptLoaded(true);
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
        script.async = true;
        script.onload = () => setScriptLoaded(true);
        document.head.appendChild(script);
    }, []);

    const getSuggestions = (val) => {
        if (!window.google || val.length < 2) return setSuggestions([]);
        new window.google.maps.places.AutocompleteService().getPlacePredictions(
            { input: val, types: ["address"], componentRestrictions: { country: "in" } },
            (preds, status) =>
                status === "OK" ? setSuggestions(preds) : setSuggestions([])
        );
    };

    const handleSelect = (place) => {
        setQuery(place.description);
        setSuggestions([]);
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ placeId: place.place_id }, (res, status) => {
            if (status === "OK" && res[0]) {
                const loc = res[0].geometry.location;
                const data = { lat: loc.lat(), lng: loc.lng(), address: place.description };
                setSelected(data);
                setStep("map");
            }
        });
    };

    useEffect(() => {
        if (step !== "map" || !selected || !window.google) return;
        const map = new window.google.maps.Map(document.getElementById("map"), {
            center: selected,
            zoom: 16,
        });
        new window.google.maps.Marker({ position: selected, map });

        map.addListener("click", (e) => {
            const lat = e.latLng.lat(), lng = e.latLng.lng();
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (res, status) => {
                if (status === "OK" && res[0]) {
                    setSelected({ lat, lng, address: res[0].formatted_address });
                    setQuery(res[0].formatted_address);
                }
            });
        });
    }, [step, selected]);
    async function formSubmit(e) {
    e.preventDefault();

    const fd = new FormData();

    for (const key in formData) {
        fd.append(key, formData[key]);
    }

    fd.append("latitude", selected?.lat || "");
    fd.append("longitude", selected?.lng || "");
    fd.append("full_address", selected?.address || "");

    try {
        const res = await axiosConfig.post("/accounts/address/", fd, {
            withCredentials : true,
            headers: {
                "Content-Type": "application/json",
            },
        });
        if(res.data.success) {
            toast.success(res.data.message)
        }
    } catch (error) {
        console.log(error);
    }
}

    return (
        <div className="address-container">
            <div className="address-left">
                {step === "default" && (
                    <>
                        <h3>Select Delivery Address</h3>
                        <button onClick={() => setStep("add")} className="address-add-btn">
                            + Add new address
                        </button>
                    </>
                )}

                {step === "add" && (
                    <>
                        <h3 className="address-add-new">Add new address</h3>
                        <div className="address-search-bar">
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    getSuggestions(e.target.value);
                                }}
                                placeholder="Search my location"
                            />
                            <FiSearch className="address-search-icon" />
                            {suggestions.length > 0 && (
                                <div className="suggestions-dropdown">
                                    {suggestions.map((s) => (
                                        <div key={s.place_id} onClick={() => handleSelect(s)} className="map-suggestion">
                                            <IoLocationOutline className="map-alt" />  <span>{s.description}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {!scriptLoaded && <p>Loading maps...</p>}
                    </>
                )}

                {step === "map" && selected && (
                    <>
                        <h3 className="address-confirm-title">Confirm Location</h3>
                        <div className="selected-address">
                            <div className="selected-address">
                                <IoLocationOutline className="map-alt" /> {selected.address}
                            </div>
                        </div>
                        <div id="map" className="map-view" />
                        <div className="map-actions">
                            <button type="button" onClick={() => setStep("add")} className="address-confirm-btn">change</button>
                            <button className="address-confirm-btn" onClick={() => setStep("address")}>confirm</button>
                        </div>
                    </>
                )}
                {step === "address" && (
                    <form className="address-form" onSubmit={formSubmit}>
                        <div className="selected-address-box">
                            <div className="address-head">
                                <div className="area-name"><IoLocationOutline className="map-alt me-1" />{selected?.address?.split(",")[0]}</div>
                                <div> <button className="address-confirm-btn" onClick={() => setStep("add")}>
                                    CHANGE
                                </button></div>
                            </div>
                            <div className="area-details">{selected?.address}</div>
                        </div>
                        <div className="address-form-box">
                            <div className="input-field">
                                <label htmlFor="locality">Country</label>
                                <input
                                    type="text"
                                    className="input-box-address"
                                    placeholder="Country"
                                    value={formData.country}
                                    onChange={(e) =>
                                        setFormData({ ...formData, country: e.target.value })
                                    }
                                />
                            </div>
                            <div className="input-double">
                                <div className="input-field">
                                    <label htmlFor="floor">Full Name</label>
                                    <input
                                        type="text"
                                        className="input-box-address"
                                        placeholder="Full Name"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="input-field">
                                    <label htmlFor="houseNo">Mobile Number</label>
                                    <input
                                        type="text"
                                        className="input-box-address"
                                        placeholder="Mobile Number"
                                        value={formData.mobileno}
                                        onChange={(e) =>
                                            setFormData({ ...formData, mobileno: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                            <div className="label-title">
                                <div className="input-double">

                                    <div className="input-field">
                                        <label htmlFor="houseNo">Flat no</label>
                                        <input
                                            type="text"
                                            className="input-box-address"
                                            placeholder="House/Apartment no"
                                            value={formData.flat_no}
                                            onChange={(e) =>
                                                setFormData({ ...formData, flat_no: e.target.value })
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="input-field">
                                <label htmlFor="houseName">Address line 1</label>
                                <input
                                    type="text"
                                    className="input-box-address"
                                    placeholder="Address line 1"
                                    value={formData.address_line_1}
                                    onChange={(e) =>
                                        setFormData({ ...formData, address_line_1: e.target.value })
                                    }
                                />
                            </div>

                            <div className="input-field">
                                <label htmlFor="locality">Address line 2</label>
                                <input
                                    type="text"
                                    className="input-box-address"
                                    placeholder="Address line 2"
                                    value={formData.address_line_2}
                                    onChange={(e) =>
                                        setFormData({ ...formData, address_line_2: e.target.value })
                                    }
                                />
                            </div>
                            <div className="label-title">

                                <div className="input-double">
                                    <div className="input-field">
                                        <label htmlFor="floor">Zipcode</label>
                                        <input
                                            type="text"
                                            className="input-box-address"
                                            placeholder="Zipcode"
                                            value={formData.zipcode}
                                            onChange={(e) =>
                                                setFormData({ ...formData, zipcode: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="input-field">
                                        <label htmlFor="floor">City</label>
                                        <input
                                            type="text"
                                            className="input-box-address"
                                            placeholder="City"
                                            value={formData.city}
                                            onChange={(e) =>
                                                setFormData({ ...formData, city: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="input-field">
                                        <label htmlFor="houseNo">State</label>
                                        <input
                                            type="text"
                                            className="input-box-address"
                                            placeholder="State"
                                            value={formData.state}
                                            onChange={(e) =>
                                                setFormData({ ...formData, state: e.target.value })
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button type="submit">Proceed</button>
                    </form>
                )}
            </div>

            <div className="address-right">
                <div className="delivery-estimate-title">Delivery Estimate</div>
                <div className="address-delivery-estimate-time">
                    <TbTruckDelivery className="truck-icon" />
                    <div>
                        {selected
                            ? "Address confirmed! Delivery estimate will be calculated."
                            : "Add a new address to get a delivery estimate."}
                    </div>
                </div>
            </div>
        </div>
    );
}

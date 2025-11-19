import React, { useEffect, useRef, useState } from 'react'
import axiosConfig from "../../Services/axiosConfig"
import "./addresses.css"
import { BiEdit, BiTrash } from 'react-icons/bi';
import { toast } from 'react-toastify';
import { IoLocationOutline } from 'react-icons/io5';
import { FiSearch } from 'react-icons/fi';
const API_KEY = "AIzaSyDD8frd15FoMhemosVqGvVBCHaRjLgNszc";
function AddressesPage() {
  const userId = localStorage.getItem("userid")
  const [step, setStep] = useState("default")
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editId, setEditId] = useState(null)
  const [query, setQuery] = useState("");
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
    user: userId
  })
  const inputRef = useRef();
  async function fetchAddress() {
    setLoading(true)
    try {
      const res = await axiosConfig.get(`/accounts/address/?user=${userId}&is_suspended=false`)
      setAddresses(res?.data?.results)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAddress();
  }, [userId])
  async function deleteAddress(id) {
    try {
      const res = await axiosConfig.delete(`/accounts/address/${id}`)
      toast.success(res.data.message)
      await fetchAddress()
    } catch (error) {
      console.log(error)
    }
  }
  async function editAddress(id) {
    setStep("address")
    setEditId(id)
    try {
      const res = await axiosConfig(`/accounts/address/${id}`,)
      console.log(res)
      const Data = res?.data;
      setFormData({
        name: Data?.name || "",
        address_line_1: Data?.address_line_1 || "",
        address_line_2: Data.address_line_2 || "",
        flat_no: Data?.flat_no || "",
        landmark: Data?.landmark || "",
        zipcode: Data?.zipcode || "",
        mobileno: Data?.mobileno | "",
        country: Data?.country || "",
        state: Data?.state || "",
        city: Data.city || "",
      })
      setSelected({
        lat: Data.latitude,
        lng: Data.longitude,
        address: Data?.address_line_1,
      });

      await fetchAddress()
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(() => {
    if (window.google) return setScriptLoaded(true);
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);
  }, []);
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
  const getSuggestions = (val) => {
    if (!window.google || val.length < 2) return setSuggestions([]);
    new window.google.maps.places.AutocompleteService().getPlacePredictions(
      { input: val, types: ["address"], componentRestrictions: { country: "in" } },
      (preds, status) =>
        status === "OK" ? setSuggestions(preds) : setSuggestions([])
    );
  };
  async function formSubmit(e) {
    e.preventDefault();
    const payload = {
      ...formData,
      latitude: selected?.lat || "",
      longitude: selected?.lng || "",
      address_line_1: selected?.address || "",
    };

    try {
      let res;
      if (editId) {
        res = await axiosConfig.patch(`/accounts/address/${editId}/`, payload, {
          headers: {
            "Content-Type": "application/json",
          },
        })
      } else {
        res = await axiosConfig.post("/accounts/address/", payload, {
          headers: {
            "Content-Type": "application/json",
          },
        });
      }

      if (res.data.success) {
        toast.success(res.data.message);
      }
      setStep("default")
      await fetchAddress()
    } catch (error) {
      console.log(error);
    } finally {
      setFormData({})
    }
  }
  useEffect(() => {
          if (selected?.address) {
              setFormData(prev => ({
                  ...prev,
                  address_line_1: selected.address
              }));
          }
      }, [selected]);
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
  return (
    <>
      {
        loading ? <div className='spinner-loader'><img src={require("../Assets/spinner.gif")} height={150} width={150} /></div> : (
          <div className="add-wrapper">
            {
              step === "default" && (
                <>
                  <button className="add-btn" onClick={() => setStep("add")}>
                    + Add new address
                  </button>

                  <div className="add-container">
                    <div className="add-list">
                      {addresses.map((add) => (
                        <div key={add.id} className="add-box">

                          <div className="add-username">
                            <div>
                              {add.name}
                              {add.id === 0 && <span className="add-default">Default</span>}
                            </div>
                            <div>
                              <BiEdit className='addres-action-icon' onClick={() => editAddress(add.id)} />
                              <BiTrash className='addres-action-icon' onClick={() => deleteAddress(add.id)} />
                            </div>
                          </div>

                          <div className="add-city">
                            {add.city} {add.pincode}
                          </div>

                          <div className="add-fulladdress">
                            {add.flat_no}, {add.address_line_1}, {add.address_line_2}, {add.city},
                            {add.state}, {add.country} - {add.zipcode}
                          </div>

                          <div className="add-phone">
                            Contact Number : <span>{add.mobileno}</span>
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )
            }
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
                <div className="selected-addresses-box">
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
                    <label htmlFor="locality">Country <span className="sup-color">*</span></label>
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
                      <label htmlFor="floor">Full Name <span className="sup-color">*</span></label>
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
                      <label htmlFor="houseNo">Mobile Number <span className="sup-color">*</span></label>
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
                        <label htmlFor="houseNo">Flat no <span className="sup-color">*</span></label>
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
                    <label htmlFor="houseName">Address line 1 <span className="sup-color">*</span></label>
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
                    <label htmlFor="locality">Address line 2 <span className="sup-color">*</span></label>
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
                        <label htmlFor="floor">Zipcode <span className="sup-color">*</span></label>
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
                        <label htmlFor="floor">City <span className="sup-color">*</span></label>
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
                        <label htmlFor="houseNo">State <span className="sup-color">*</span></label>
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
                <button type="submit" className="address-proceed-btn">{editId ? "UPDATE" : "PROCEED"}</button>
              </form>
            )}
          </div>
        )
      }
    </>
  )
}

export default AddressesPage

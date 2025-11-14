import React, { useState, useRef, useEffect } from "react";
import { Modal, Spinner } from "react-bootstrap";
import axiosConfig from "../../Services/axiosConfig";
import "./login.css"

const LoginModal = ({ show, onHide, onLoginSuccess  }) => {
  const [step, setStep] = useState("input");
  const [contact, setContact] = useState("");
  const [contactType, setContactType] = useState("");
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const refs = useRef([...Array(4)].map(() => React.createRef()));

  const reset = () => {
    setStep("input");
    setContact("");
    setContactType("");
    setDigits(["", "", "", ""]);
    setMsg("");
    setErr("");
    setLoading(false);
    setSecondsLeft(0);
  };

  const close = () => {
    reset();
    onHide();
  };

  useEffect(() => {
    if (step === "otp") setSecondsLeft(30);
  }, [step]);



  useEffect(() => {
    if (step !== "otp" || secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [step, secondsLeft]);

  const sendOtp = async () => {
    const trimmed = contact.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[6-9]\d{9}$/;
    const isNumericOnly = /^\d+$/.test(trimmed);

    if (!trimmed) {
      setErr("Please enter mobile number or email");
      return;
    }

    if (isNumericOnly) {
      if (phoneRegex.test(trimmed)) {
        setContactType("mobile");
      } else {
        setErr("Enter a valid 10-digit mobile number starting with 6-9");
        return;
      }
    }
    else {
      if (emailRegex.test(trimmed)) {
        setContactType("email");
      } else {
        setErr(trimmed.includes("@")
          ? "Enter a valid email format (e.g., user@example.com)"
          : "Enter either a valid email or 10-digit mobile number");
        return;
      }
    }

    setLoading(true);
    try {
      const { data } = await axiosConfig.post("accounts/validate_contact/", {
        contact: trimmed,
        role: "Customer",
      });
      setMsg(data.message || `OTP sent to ${trimmed}`);
      setErr("");
      setStep("otp");
      setSecondsLeft(30);
      setDigits(["", "", "", ""]);
    } catch (e) {
      setErr(e.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    const otp = digits.join("");
    if (otp.length !== 4) {
      setErr("Enter full 4-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axiosConfig.post("accounts/verify_otp/", {
        contact,
        otp,
      });
      if (data.token) localStorage.setItem("token", data.token);
      if (data.user_id) localStorage.setItem("userid", data.user_id);
      setMsg(data.message || "Verified!");
      setErr("");
      setStep("success");
      if (onLoginSuccess) {
        onLoginSuccess(data.user_id);
      }
      setTimeout(close, 1000);
    } catch (e) {
      setErr(e.response?.data?.message || "Wrong OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (v, i) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    if (v && i < 3) refs.current[i + 1].current.focus();
  };

  const handleKeyDown = (e, i) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1].current.focus();
    }
  };

  return (
    <Modal show={show} onHide={close} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {step === "input"}
          {step === "otp" && "Enter OTP"}
          {step === "success" && "Verified"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {msg && <div className="alert py-1" style={{
              background : "#5c6bc0",
              color:"#FFFF"
            }}><div className="d-flex justify-content-between flex-wrap align-items-center small">
          <span>
            Enter 4-digit code sent to your {contactType === "mobile" ? "phone" : "email"} {contact}
          </span>
          <button
            className="btn btn-sm p-0 fw-bold"
            onClick={() => {
              setStep("input");
              setDigits(["", "", "", ""]);
              setErr("");
              setMsg("");
            }}
          >
            Change
          </button>
        </div></div>}

        {loading && (
          <div className="text-center my-2">
            {/* <Spinner animation="border" size="xl" /> */}
            <img src={require("../Assets/spinner.gif")} height={100} width={100} />
          </div>
        )}

        {step === "input" && (
          <div className="text-center">
            <div className="heading">
                <div>Let’s</div>
            <div>get <span>Started</span></div>
            </div>
            <p className="login-title">
              Enter your phone number to proceed
            </p>
            <div className="d-flex align-items-center mb-3" style={{ justifyContent: "center" }}>
              <input
                className="form-control"
                style={{ maxWidth: "290px",border : "1px solid " }}
                placeholder="Mobile Number"
                value={contact}
                onChange={(e) => {
                  setContact(e.target.value);
                  setErr("");
                }}
              />
              
            </div>
                    {err && <div className="text-danger mb-3" style={{ fontSize: "0.875rem", textAlign : "center" }}>{err}</div>}

            <button
              className="btn btn-primary"
              style={{
                background : "#5c6bc0",
                color: "#fff",
                width: "70%",
                fontWeight: "500",
              }}
              onClick={sendOtp}
            >
              Next
            </button>
          </div>
        )}


        {step === "otp" && (
          <>
            <div className="d-flex justify-content-center mb-3">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={refs.current[i]}
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleChange(e.target.value, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  className="form-control text-center mx-1"
                  style={{ width: 48, fontSize: "1.5rem", border : "2px solid black" }}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {secondsLeft > 0 ? (
              <p className="small text-muted mb-2">
                Resend OTP in {secondsLeft}s
              </p>
            ) : (
              <button
                className="btn btn-link p-0 mb-2"
                onClick={sendOtp}
                disabled={loading}
              >
                Resend OTP
              </button>
            )}

            <button className="btn w-100" style={{background:"#5c6bc0", color : "#FFFF"}} onClick={verifyOtp}>
              Submit
            </button>
          </>
        )}


        {step === "success" && (
          <div className="text-center">
            <h5 className="mb-0">Verified Successfully</h5>
            <button className="btn mt-3" style={{background : "#5c6bc0", color:"#FFFF"}} onClick={close}>
              Close
            </button>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default LoginModal;

import React, { useState, useRef, useEffect } from "react";
import { Modal, Spinner } from "react-bootstrap";
import axiosConfig from "../../Services/axiosConfig";
import "./login.css"

const LoginModal = ({ show, onHide, onLoginSuccess }) => {
  const [step, setStep] = useState("input");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
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
  const handleUserDataSubmit = async () => {
    if (!userName.trim()) {
      setErr("Name is required");
      return;
    }

    if (!userEmail.trim()) {
      setErr("Email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      setErr("Enter a valid email");
      return;
    }

    setErr("");
    setLoading(true);

    try {
      const res = await axiosConfig.patch(
        `/user_data/users/${localStorage.getItem("userid")}/`,
        {
          full_name: userName,
          email: userEmail,
        }
      );

      // Save updated name
      localStorage.setItem("name", res?.data.results?.full_name);

      // Notify parent component
      if (onLoginSuccess) onLoginSuccess(localStorage.getItem("userid"));

      // 👉 NEW USER → close modal after saving data
      close();

    } catch (e) {
      setErr(e.response?.data?.error || "Failed to save user data");
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
      if (data.name) localStorage.setItem("name", data.name);

      setMsg(data.message || "Verified!");
      setErr("");

      if (data.new_user === false) {
        setStep("userdata");
      } else {
        // if (onLoginSuccess) onLoginSuccess(data.user_id);
        // close()
        if (onLoginSuccess) onLoginSuccess(data.user_id);
        close();
      }

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
        {step === "otp" && msg && (
          <div className="validation-text">
            <span>
              Enter 4-digit code sent to your {contactType === "mobile" ? "phone" : "email"} {contact}
            </span>
            <button
              onClick={() => {
                setStep("input");
                setDigits(["", "", "", ""]);
                setErr("");
                setMsg("");
              }}
            >
              Change
            </button>
          </div>
        )}


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
                style={{ maxWidth: "290px", border: "1px solid " }}
                placeholder="Mobile Number"
                value={contact}
                maxLength={10}
                onChange={(e) => {
                  setContact(e.target.value);
                  setErr("");
                }}
              />

            </div>
            {err && <div className="text-danger mb-3" style={{ fontSize: "0.875rem", textAlign: "center" }}>{err}</div>}

            <button
              className="next-btn-login"

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
                  style={{ width: 48, fontSize: "1.5rem", border: "2px solid black" }}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {secondsLeft > 0 ? (
              <p className="small text-muted mb-2 d-flex justify-content-center">
                Resend OTP in {secondsLeft}s
              </p>
            ) : (
              <button
                className="resendotp"
                onClick={sendOtp}
                disabled={loading}
              >
                Resend OTP
              </button>
            )}

            <button className="next-btn-login" onClick={verifyOtp}>
              Submit
            </button>
          </>
        )}
        {step === "userdata" && (
          <div className="userdata-form">

            <div className="mb-3">
              <label className="form-label">Name</label>
              <input
                className="form-control"
                style={{ border: "1px solid" }}
                type="text"
                placeholder="Enter Name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                className="form-control"
                style={{ border: "1px solid" }}
                type="email"
                placeholder="Enter Email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
              />
            </div>

            {err && (
              <div className="text-danger mb-2 small">
                {err}
              </div>
            )}

            <button
              className="savecontinue-btn"
              onClick={handleUserDataSubmit}
            >
              Save & Continue
            </button>

          </div>
        )}


        {step === "success" && (
          <div className="text-center">
            <h5 className="mb-0">Verified Successfully</h5>
            <button className="next-btn-login" onClick={close}>
              Close
            </button>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default LoginModal;

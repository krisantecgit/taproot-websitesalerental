import React from "react";
import "./footer.css";
import { FaInstagram, FaFacebookF, FaTwitter, FaYoutube } from "react-icons/fa";

function Footer() {
    return (
        <footer className="footer-container">
            <div className="footer-top">
                <div className="footer-brand">
                    <img src={require("../Assets/taproot.png")} alt="Furlenco Logo" className="footer-logo" />
                    <div className="footer-socials">
                        <FaInstagram />
                        <FaFacebookF />
                        <FaTwitter />
                        <FaYoutube />
                    </div>
                </div>

                <div className="footer-links">
                    <div href="/">Home</div>
                    <div href="/buy">Buy Furniture</div>
                    <div href="/rent">Rent Furniture</div>
                    <div href="/investors">For Investors</div>

                </div>
                <div className="footer-links">
                    <div href="/about">About Us</div>
                    <div href="/privacy">Privacy Policy</div>
                    <div href="/terms">Terms & Conditions</div>
                    <div href="/store">Find Store</div>
                </div>


                <div className="footer-help">
                    <h4>NEED HELP?</h4>
                    <button className="help-btn">HELP CENTER</button>
                </div>
            </div>

            <div className="footer-bottom">
                <p>We deliver to:</p>
                <div className="footer-cities">
                    Bengaluru, Mumbai, Pune, Delhi, Gurugram, Noida, Hyderabad, Chennai, Ghaziabad, Faridabad, Jaipur, Mysuru, Chandigarh, Vijayawada, Nashik, Sonipat, Patiala, Meerut, Panipat, Ambala, Karnal, Hisar, Kolkata, Ahmedabad, Coimbatore, Gandhinagar, Lucknow, Indore
                </div>
                <div className="footer-apps">
                    <img src="/google-play.png" alt="Google Play" />
                    <img src="/app-store.png" alt="App Store" />
                </div>
            </div>
        </footer>
    );
}

export default Footer;

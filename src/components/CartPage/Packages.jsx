import { Offcanvas } from "react-bootstrap";
import "./packagespnan.css"
function PackagesPlan({ showPackages, handleClose, packages, selectedPkg, onSelectPackage }) {
  return (
    <div className="month-wrapper">
      <Offcanvas show={showPackages} onHide={handleClose} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Select Rental Package</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {packages.map(pkg => {
            const isSelected = selectedPkg?.id === pkg.id;

            return (
              <div
                key={pkg.id}
                className={`pkg-card ${isSelected ? "pkg-active" : ""}`}
                onClick={() => onSelectPackage(pkg)}
              >
                <div className="pkg-discount">-{pkg.discount_percent}%</div>
                <div className="pkg-left-content">
                  <p className="pkg-duration">{pkg.duration_value} Months</p>
                  <p className="pkg-price">₹{Math.round(pkg.offer_price / pkg.duration_value)}/month</p>
                  <p className="pkg-old-price">₹{Math.round(pkg.price)}/month</p>
                </div>
                <button className={`pkg-btn ${isSelected ? "selected" : ""}`}>
                  {isSelected ? "Selected" : "Select"}
                </button>
              </div>
            );
          })}
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}

export default PackagesPlan;
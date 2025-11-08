import React from 'react'
import "./advertise.css"
import truckbanner from "../Assets/truckbanner.png"
function AdvertiseBanner() {
    return (
        <div className='adv-banner'>
            <img src={truckbanner} />
        </div>
    )
}

export default AdvertiseBanner
import React from 'react'
import Category from '../Category/Category'
import Header from '../header/Header'
import BuyPageBanner from '../BuyPage/BuypageBanner/BuypageBanner'
import OffersSection from '../offersection/Offersection'
import Footer from '../Footer/Footer'

function RentPage() {
  return (
    <div>
        <Header />
        <Category listingType="rent" />
        <BuyPageBanner />
        <OffersSection />
        <Footer />
    </div>
  )
}

export default RentPage
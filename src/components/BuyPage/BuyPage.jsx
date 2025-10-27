import React from 'react'
import FurnitureGrid from './Categories/BuypageCategories'
import Header from '../header/Header'
import BuyPageBanner from './BuypageBanner/BuypageBanner'
import OffersSection from '../offersection/Offersection'
import Footer from '../Footer/Footer'

function BuyPage() {
  return (
    <div>
        <Header />
        <FurnitureGrid />
        <BuyPageBanner />
        <OffersSection />
        <Footer />
    </div>
  )
}

export default BuyPage
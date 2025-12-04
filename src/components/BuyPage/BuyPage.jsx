import React from 'react'
import Header from '../header/Header'
import BuyPageBanner from './BuypageBanner/BuypageBanner'
import OffersSection from '../offersection/Offersection'
import Footer from '../Footer/Footer'
import Category from '../Category/Category'
import useHomepageData from '../../Hook/useHomepageData'
import "./buypage.css"
function BuyPage() {
  const cms = useHomepageData()
  return (
    <div className='buy-page-container'>
        <Header />
        <Category listingType="buy" />
        <BuyPageBanner />
        <OffersSection data={cms.coupons} />
        <Footer />
    </div>
  )
}

export default BuyPage
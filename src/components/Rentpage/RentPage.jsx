import React from 'react'
import Category from '../Category/Category'
import Header from '../header/Header'
import BuyPageBanner from '../BuyPage/BuypageBanner/BuypageBanner'
import OffersSection from '../offersection/Offersection'
import Footer from '../Footer/Footer'
import useHomepageData from '../../Hook/useHomepageData'

function RentPage() {
  const cms = useHomepageData()
  return (
    <div>
        <Header />
        <Category listingType="rent" />
        <BuyPageBanner />
        <OffersSection data={cms.coupons} />
        <Footer />
    </div>
  )
}

export default RentPage
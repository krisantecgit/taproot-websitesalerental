import React from 'react'
import Header from '../header/Header'
import Section from '../section/Section'
import BannerSection from '../section/BannerSection'
import OffersSection from '../offersection/Offersection'
import HeroCarousel from '../carousel/Herocarousel'
import FeedbackCarousel from '../FeedBack/FeedbackCarousel'
import AdvertiseBanner from '../AdvertiseBanner/AdvertiseBanner'
import Footer from '../Footer/Footer'

function Home() {
    return (
        <div>
            <Header />
            <Section />
            <BannerSection />
            <OffersSection />
            <HeroCarousel />
            <FeedbackCarousel />
            <AdvertiseBanner />
            <Footer />
        </div>
    )
}

export default Home
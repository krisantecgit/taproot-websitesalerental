import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './components/Home/Home';
import BuyPage from './components/BuyPage/BuyPage';
import Cartpage from './components/CartPage/Cartpage';
import RentPage from './components/Rentpage/RentPage';
import FriendlyUrlComponent from './components/Pages/FriendlyUrl';
import SearchedData from './components/Pages/SearchedData';
import AddressPage from './components/Pages/AddressPage';
import Checkout from './components/Pages/Checkout';
import Payment from './components/Pages/Payment';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/buy' element={<BuyPage />} />
        <Route path='/rent' element={<RentPage />} />
        <Route path='/cart' element={<Cartpage />} />
        <Route path="/search/results" element={<SearchedData />} />
        <Route path="/:friendlyurl" element={<FriendlyUrlComponent />} />
        <Route path='/:categoryurl/:friendlyurl' element={<FriendlyUrlComponent />} />
        <Route path='/:categoryurl/product/:friendlyurl' element={<FriendlyUrlComponent />} />
        <Route path='/product/:friendlyurl' element={<FriendlyUrlComponent />} />
        <Route path='/address' element={<AddressPage />} />
        <Route path='/checkout' element={<Checkout />} />
        <Route path='/payment' element={<Payment />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

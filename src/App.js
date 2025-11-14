import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './components/Home/Home';
import BuyPage from './components/BuyPage/BuyPage';
import Cartpage from './components/CartPage/Cartpage';
import RentPage from './components/Rentpage/RentPage';
import FriendlyUrlComponent from './components/Pages/FriendlyUrl';
import SearchedData from './components/Pages/SearchedData';
import AddressPage from './components/Pages/AddressPage';
import Checkout from './components/Pages/Checkout';
import Payment from './components/Pages/Paymentpage';
import AccountLayout from './components/AccountLayout/AccountLayout';
import Orders from './components/Pages/Orders';
import Logout from './utils/Logout';
import ProtectedRoute from './utils/ProtectedRoutes';
import AddressesPage from './components/Pages/AddressesPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/logout' element={<Logout />} />
        <Route path='/buy' element={<BuyPage />} />
        <Route path='/rent' element={<RentPage />} />
        <Route path='/cart' element={<Cartpage />} />
        <Route path='' element={<ProtectedRoute />}>
          <Route path='/address' element={<AddressPage />} />
          <Route path='/checkout' element={<Checkout />} />
          <Route path='/payment' element={<Payment />} />
          <Route path='/account' element={<AccountLayout />}>
            <Route path="orders" element={<Orders />} />
            <Route path="addresses" element={<AddressesPage />} />
          </Route>
        </Route>
        <Route path="/search/results" element={<SearchedData />} />
        <Route path="/:friendlyurl" element={<FriendlyUrlComponent />} />
        <Route path='/:categoryurl/:friendlyurl' element={<FriendlyUrlComponent />} />
        <Route path='/:categoryurl/product/:friendlyurl' element={<FriendlyUrlComponent />} />
        <Route path='/product/:friendlyurl' element={<FriendlyUrlComponent />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

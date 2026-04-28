import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import "./App.css"
import FriendlyUrlComponent from './components/Pages/FriendlyUrl';
import AccountLayout from './components/AccountLayout/AccountLayout';
import Logout from './utils/Logout';
import ProtectedRoute from './utils/ProtectedRoutes';
import AccountMenu from './components/AccountLayout/AccountMenu';
const Home = lazy(() => import("./components/Home/Home"))
const BuyPage = lazy(() => import("./components/BuyPage/BuyPage"))
const RentPage = lazy(() => import("./components/Rentpage/RentPage"))
const Cartpage = lazy(() => import("./components/CartPage/Cartpage"))
const SearchedData = lazy(() => import("./components/Pages/SearchedData"))
const Payment = lazy(() => import("./components/Pages/Paymentpage"))
const AddressPage = lazy(() => import("./components/Pages/AddressPage"))
const Checkout = lazy(() => import("./components/Pages/Checkout"))
const Orders = lazy(() => import("./components/Pages/Orders"))
const AddressesPage = lazy(() => import("./components/Pages/AddressesPage"))
const WishListPage = lazy(() => import("./components/WishList/WishListPage"))
const OrderDetails = lazy(() => import("./components/Pages/OrderDetails"))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/logout' element={<Logout />} />
          <Route path='/buy' element={<BuyPage />} />
          <Route path='/rent' element={<RentPage />} />
          <Route path='/cart' element={<Cartpage />} />
          <Route path='' element={<ProtectedRoute />}>
            <Route path='/address' element={<AddressPage />} />
            <Route path='/my/wishlist' element={<WishListPage />} />
            <Route path='/checkout' element={<Checkout />} />
            <Route path='/payment' element={<Payment />} />
            <Route path='/account' element={<AccountLayout />}>
              <Route path="orders" element={<Orders />} />
              <Route path="orders/order-details" element={<OrderDetails />} />
              <Route path="addresses" element={<AddressesPage />} />
              <Route path="menu" element={<AccountMenu />} />
            </Route>
          </Route>
          <Route path="/search/results" element={<SearchedData />} />
          <Route path="/:friendlyurl" element={<FriendlyUrlComponent />} />
          <Route path='/:categoryurl/:friendlyurl' element={<FriendlyUrlComponent />} />
          <Route path='/:categoryurl/product/:friendlyurl' element={<FriendlyUrlComponent />} />
          <Route path='/product/:friendlyurl' element={<FriendlyUrlComponent />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;

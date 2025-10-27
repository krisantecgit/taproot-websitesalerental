import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './components/Home/Home';
import BuyPage from './components/BuyPage/BuyPage';
import Product from './components/Products/Product';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/buy' element={<BuyPage />} />
        <Route path='/rent' element={<Product />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

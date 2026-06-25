import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Orders from './pages/Admin/Orders';
import Products from './pages/Admin/Products';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/admin/orders" element={<Orders />} />
      <Route path="/admin/products" element={<Products />} />
    </Routes>
  );
}
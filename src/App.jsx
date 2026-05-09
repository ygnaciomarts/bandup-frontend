import { Routes, Route } from 'react-router-dom'
import { Box } from '@mui/material'
import Header from './components/Header'
import Footer from './components/Footer'
import LoginModal from './components/LoginModal'
import RegisterModal from './components/RegisterModal'
import PrivateRoute from './components/PrivateRoute'
import AdminRoute from './components/AdminRoute'
import Home from './pages/Home'
import Product from './pages/Product'
import Search from './pages/Search'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import MyAccount from './pages/MyAccount'
import OrderSuccess from './pages/OrderSuccess'
import AdminDashboard from './pages/AdminDashboard'
import About from './pages/About'
import Contact from './pages/Contact'
import Wishlist from './pages/Wishlist'
import NotFound from './pages/NotFound'
import StyleGuide from './pages/StyleGuide'
import ResetPassword from './pages/ResetPassword'

export default function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <LoginModal />
      <RegisterModal />
      <Box component="main" sx={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/search" element={<Search />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
          <Route path="/my-account" element={<PrivateRoute><MyAccount /></PrivateRoute>} />
          <Route path="/order-success/:id" element={<PrivateRoute><OrderSuccess /></PrivateRoute>} />
          <Route path="/quienes-somos" element={<About />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/wishlist" element={<PrivateRoute><Wishlist /></PrivateRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/styleguide" element={<StyleGuide />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Box>
      <Footer />
    </Box>
  )
}

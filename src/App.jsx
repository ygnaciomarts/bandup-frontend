import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import { Box, CircularProgress, Container, Skeleton } from '@mui/material'
import Header from './components/Header'
import Footer from './components/Footer'
import LoginModal from './components/LoginModal'
import RegisterModal from './components/RegisterModal'
import PrivateRoute from './components/PrivateRoute'
import AdminRoute from './components/AdminRoute'
import { useAuth } from './context/AuthContext'

// Eager-loaded (above-the-fold)
import Home from './pages/Home'

// Lazy-loaded routes
const Product = lazy(() => import('./pages/Product'))
const Search = lazy(() => import('./pages/Search'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const MyAccount = lazy(() => import('./pages/MyAccount'))
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const Wishlist = lazy(() => import('./pages/Wishlist'))
const NotFound = lazy(() => import('./pages/NotFound'))
const StyleGuide = lazy(() => import('./pages/StyleGuide'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const Collections = lazy(() => import('./pages/Collections'))
const Collection = lazy(() => import('./pages/Collection'))

function PageLoader() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Skeleton variant="rounded" width="35%" height={28} sx={{ mb: 1, borderRadius: 1 }} />
      <Skeleton width="20%" height={16} sx={{ mb: 4 }} />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Box key={i} sx={{ width: { xs: 'calc(50% - 12px)', sm: 'calc(33.33% - 16px)', md: 'calc(25% - 18px)' } }}>
            <Skeleton variant="rounded" sx={{ aspectRatio: '1', width: '100%', borderRadius: 2 }} />
            <Skeleton sx={{ mt: 1.5, width: '45%', height: 10 }} />
            <Skeleton sx={{ mt: 0.8, width: '75%', height: 14 }} />
            <Skeleton sx={{ mt: 0.8, width: '30%', height: 14 }} />
          </Box>
        ))}
      </Box>
    </Container>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function LoginRedirect() {
  const { openLoginModal } = useAuth()
  useEffect(() => { openLoginModal() }, [openLoginModal])
  return <Navigate to="/" replace />
}

function RegisterRedirect() {
  const { openRegisterModal } = useAuth()
  useEffect(() => { openRegisterModal() }, [openRegisterModal])
  return <Navigate to="/" replace />
}

export default function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <ScrollToTop />
      <Header />
      <LoginModal />
      <RegisterModal />
      <Box component="main" sx={{ flex: 1 }}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:slug" element={<Product />} />
            <Route path="/search" element={<Search />} />
            <Route path="/login" element={<LoginRedirect />} />
            <Route path="/register" element={<RegisterRedirect />} />
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
            <Route path="/collections" element={<Collections />} />
            <Route path="/collection/:slug" element={<Collection />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Box>
      <Footer />
    </Box>
  )
}

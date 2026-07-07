import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Container, Typography, Button, Box, Alert, Divider, LinearProgress, TextField, InputAdornment, CircularProgress } from '@mui/material'
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { api } from '../services/api'
import { BtnAccent } from '../components/ui/Buttons'
import { PageHeader, PageSection } from '../components/ui'

const checkoutSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  direccion: z.string().min(1, 'La dirección es requerida'),
  ciudad: z.string().min(1, 'La ciudad es requerida'),
  estado: z.string().min(1, 'El estado es requerido'),
  cp: z.string().min(1, 'El código postal es requerido').regex(/^\d{5}$/, 'Código postal inválido (5 dígitos)'),
  telefono: z.string().min(1, 'El teléfono es requerido').refine(v => v.replace(/\D/g, '').length >= 10, 'Teléfono inválido (mín. 10 dígitos)'),
})

export default function Checkout() {
  const { user } = useAuth()
  const { items, total, shipping, clearCart } = useCart()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)

  const { register, handleSubmit, formState: { errors: formErrors } } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      nombre: user?.nombre || '',
      direccion: '',
      ciudad: '',
      estado: '',
      cp: '',
      telefono: '',
    },
  })

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  const handleOrder = async (formData) => {
    if (!user) {
      navigate('/login')
      return
    }

    setLoading(true)
    setError('')

    try {
      const data = await api.createOrder(items)
      if (coupon) await api.applyCoupon(coupon.id).catch(() => {})
      clearCart()
      navigate(`/order-success/${data.order.id}`)
    } catch (err) {
      setError(err.error || err.message || 'Error al procesar la orden')
    } finally {
      setLoading(false)
    }
  }

  const handleCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponError('')
    try {
      const data = await api.validateCoupon(couponCode, total)
      setCoupon(data.coupon)
    } catch (err) {
      setCouponError(err.message || 'Cupón no válido')
      setCoupon(null)
    } finally {
      setCouponLoading(false)
    }
  }

  const discount = coupon?.discount || 0
  const freeShipping = coupon?.freeShipping || false
  const finalShipping = freeShipping ? 0 : shipping
  const finalTotal = total - discount + finalShipping

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <PageHeader title="Checkout" />

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 2 }} />}

      {!user && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
          Debes <Link to="/login">iniciar sesión</Link> para completar tu compra.
        </Alert>
      )}

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit(handleOrder)} sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Left - Shipping Form + Items */}
        <Box sx={{ flex: 1 }}>
          {/* Shipping address */}
          <PageSection title="Dirección de envío" sx={{ mb: 2.5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Nombre completo"
                size="small"
                fullWidth
                {...register('nombre')}
                error={!!formErrors.nombre}
                helperText={formErrors.nombre?.message}
              />
              <TextField
                label="Dirección (calle y número)"
                size="small"
                fullWidth
                {...register('direccion')}
                error={!!formErrors.direccion}
                helperText={formErrors.direccion?.message}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Ciudad"
                  size="small"
                  fullWidth
                  {...register('ciudad')}
                  error={!!formErrors.ciudad}
                  helperText={formErrors.ciudad?.message}
                />
                <TextField
                  label="Estado"
                  size="small"
                  fullWidth
                  {...register('estado')}
                  error={!!formErrors.estado}
                  helperText={formErrors.estado?.message}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Código postal"
                  size="small"
                  fullWidth
                  {...register('cp')}
                  error={!!formErrors.cp}
                  helperText={formErrors.cp?.message}
                  inputProps={{ maxLength: 5 }}
                />
                <TextField
                  label="Teléfono"
                  size="small"
                  fullWidth
                  {...register('telefono')}
                  error={!!formErrors.telefono}
                  helperText={formErrors.telefono?.message}
                />
              </Box>
            </Box>
          </PageSection>

          {/* Order items */}
          <PageSection title="Tu orden">
            <Divider sx={{ mb: 1.5 }} />
            {items.map(item => (
              <Box key={item.cartKey || item.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.8 }}>
                <Typography variant="body2">
                  {item.title || item.nombre} {item.variantLabel && <Typography component="span" color="text.secondary" variant="caption">({item.variantLabel})</Typography>} <Typography component="span" color="text.secondary" variant="caption">x{item.qty}</Typography>
                </Typography>
                <Typography variant="body2" fontWeight={600}>${((item.price || item.precio || 0) * item.qty).toLocaleString('es-MX')}</Typography>
              </Box>
            ))}
          </PageSection>
        </Box>

        {/* Right - Summary */}
        <Box sx={{ width: { xs: '100%', md: 300 }, flexShrink: 0 }}>
          <Box sx={{ bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200', borderRadius: 2, p: 2.5, position: 'sticky', top: 100 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Subtotal</Typography>
              <Typography variant="body2">${total.toLocaleString('es-MX')}</Typography>
            </Box>
            {discount > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="success.main">Descuento ({coupon.code})</Typography>
                <Typography variant="body2" color="success.main">-${discount.toLocaleString('es-MX')}</Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Envío</Typography>
              <Typography variant="body2">{freeShipping ? <b style={{ color: '#059669' }}>Gratis</b> : finalShipping === 0 ? 'Gratis' : `$${finalShipping.toLocaleString('es-MX')}`}</Typography>
            </Box>
            {total < 799 && !freeShipping && (
              <Alert severity="info" sx={{ my: 1, py: 0, fontSize: '0.75rem', borderRadius: 1.5 }}>
                ¡Agrega ${(799 - total).toLocaleString('es-MX')} más para envío gratis!
              </Alert>
            )}

            {/* Coupon input */}
            <Box sx={{ mt: 2, mb: 2 }}>
              <TextField
                placeholder="Código de descuento"
                size="small"
                fullWidth
                value={couponCode}
                onChange={e => { setCouponCode(e.target.value); setCouponError('') }}
                onKeyDown={e => e.key === 'Enter' && handleCoupon()}
                error={!!couponError}
                helperText={couponError}
                disabled={!!coupon}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><ConfirmationNumberOutlinedIcon sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment>,
                  endAdornment: !coupon && (
                    <InputAdornment position="end">
                      <Button size="small" onClick={handleCoupon} disabled={couponLoading || !couponCode.trim()} sx={{ minWidth: 'auto', fontWeight: 600, fontSize: '0.75rem' }}>
                        {couponLoading ? <CircularProgress size={16} /> : 'Aplicar'}
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
              {coupon && (
                <Box sx={{ mt: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="success.main" fontWeight={600}>
                    {coupon.type === 'percent' ? `${coupon.value}% descuento` : coupon.type === 'free_shipping' ? 'Envío gratis' : `$${coupon.value} descuento`}
                  </Typography>
                  <Button size="small" onClick={() => { setCoupon(null); setCouponCode('') }} sx={{ minWidth: 'auto', fontSize: '0.7rem', color: 'text.secondary' }}>Quitar</Button>
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="body1" fontWeight={700}>Total</Typography>
              <Typography variant="body1" fontWeight={700}>${finalTotal.toLocaleString('es-MX')}</Typography>
            </Box>
            <BtnAccent
              fullWidth
              type="submit"
              disabled={loading || !user}
            >
              {loading ? 'Procesando...' : 'Confirmar orden'}
            </BtnAccent>
          </Box>
        </Box>
      </Box>
    </Container>
  )
}

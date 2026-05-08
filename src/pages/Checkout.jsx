import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Container, Typography, Button, Box, Alert, Divider, LinearProgress, TextField } from '@mui/material'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { api } from '../services/api'

export default function Checkout() {
  const { user } = useAuth()
  const { items, total, shipping, clearCart } = useCart()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [form, setForm] = useState({
    nombre: user?.nombre || '',
    direccion: '',
    ciudad: '',
    estado: '',
    cp: '',
    telefono: '',
  })

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const errors = {}
    if (!form.nombre.trim()) errors.nombre = 'El nombre es requerido'
    if (!form.direccion.trim()) errors.direccion = 'La dirección es requerida'
    if (!form.ciudad.trim()) errors.ciudad = 'La ciudad es requerida'
    if (!form.estado.trim()) errors.estado = 'El estado es requerido'
    if (!form.cp.trim()) errors.cp = 'El código postal es requerido'
    else if (!/^\d{5}$/.test(form.cp.trim())) errors.cp = 'Código postal inválido (5 dígitos)'
    if (!form.telefono.trim()) errors.telefono = 'El teléfono es requerido'
    else if (form.telefono.replace(/\D/g, '').length < 10) errors.telefono = 'Teléfono inválido (mín. 10 dígitos)'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleOrder = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    if (!validate()) return

    setLoading(true)
    setError('')

    try {
      const data = await api.createOrder(items)
      clearCart()
      navigate(`/order-success/${data.order.id}`)
    } catch (err) {
      setError(err.error || err.message || 'Error al procesar la orden')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>Checkout</Typography>

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 2 }} />}

      {!user && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
          Debes <Link to="/login">iniciar sesión</Link> para completar tu compra.
        </Alert>
      )}

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Left - Shipping Form + Items */}
        <Box sx={{ flex: 1 }}>
          {/* Shipping address */}
          <Box sx={{ bgcolor: '#fff', border: '1px solid #f0f0f0', borderRadius: 2, p: 2.5, mb: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.72rem', color: '#6b7280' }}>
              Dirección de envío
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Nombre completo"
                name="nombre"
                size="small"
                fullWidth
                value={form.nombre}
                onChange={handleChange}
                error={!!formErrors.nombre}
                helperText={formErrors.nombre}
              />
              <TextField
                label="Dirección (calle y número)"
                name="direccion"
                size="small"
                fullWidth
                value={form.direccion}
                onChange={handleChange}
                error={!!formErrors.direccion}
                helperText={formErrors.direccion}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Ciudad"
                  name="ciudad"
                  size="small"
                  fullWidth
                  value={form.ciudad}
                  onChange={handleChange}
                  error={!!formErrors.ciudad}
                  helperText={formErrors.ciudad}
                />
                <TextField
                  label="Estado"
                  name="estado"
                  size="small"
                  fullWidth
                  value={form.estado}
                  onChange={handleChange}
                  error={!!formErrors.estado}
                  helperText={formErrors.estado}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Código postal"
                  name="cp"
                  size="small"
                  fullWidth
                  value={form.cp}
                  onChange={handleChange}
                  error={!!formErrors.cp}
                  helperText={formErrors.cp}
                  inputProps={{ maxLength: 5 }}
                />
                <TextField
                  label="Teléfono"
                  name="telefono"
                  size="small"
                  fullWidth
                  value={form.telefono}
                  onChange={handleChange}
                  error={!!formErrors.telefono}
                  helperText={formErrors.telefono}
                />
              </Box>
            </Box>
          </Box>

          {/* Order items */}
          <Box sx={{ bgcolor: '#fff', border: '1px solid #f0f0f0', borderRadius: 2, p: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.72rem', color: '#6b7280' }}>
              Tu orden
            </Typography>
            <Divider sx={{ mb: 1.5 }} />
            {items.map(item => (
              <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.8 }}>
                <Typography variant="body2">
                  {item.nombre} <Typography component="span" color="text.secondary" variant="caption">x{item.qty}</Typography>
                </Typography>
                <Typography variant="body2" fontWeight={600}>${(item.precio * item.qty).toLocaleString('es-MX')}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Right - Summary */}
        <Box sx={{ width: { xs: '100%', md: 280 }, flexShrink: 0 }}>
          <Box sx={{ bgcolor: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 2, p: 2.5, position: 'sticky', top: 100 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Subtotal</Typography>
              <Typography variant="body2">${total.toLocaleString('es-MX')}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Envío</Typography>
              <Typography variant="body2">{shipping === 0 ? 'Gratis' : `$${shipping.toLocaleString('es-MX')}`}</Typography>
            </Box>
            {total < 799 && (
              <Alert severity="info" sx={{ my: 1, py: 0, fontSize: '0.75rem', borderRadius: 1.5 }}>
                ¡Agrega ${(799 - total).toLocaleString('es-MX')} más para envío gratis!
              </Alert>
            )}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="body1" fontWeight={700}>Total</Typography>
              <Typography variant="body1" fontWeight={700}>${(total + shipping).toLocaleString('es-MX')}</Typography>
            </Box>
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              onClick={handleOrder}
              disabled={loading || !user}
            >
              {loading ? 'Procesando...' : 'Confirmar orden'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  )
}

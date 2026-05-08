import { Link } from 'react-router-dom'
import { Container, Typography, Button, Box, IconButton, Divider } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const { items, updateQty, removeItem, total, shipping, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
        <Box sx={{
          width: 64, height: 64, borderRadius: '50%', bgcolor: '#f5f5f5',
          display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5
        }}>
          <ShoppingBagOutlinedIcon sx={{ fontSize: 28, color: '#9ca3af' }} />
        </Box>
        <Typography variant="h6" fontWeight={700} sx={{ color: '#282d35', mb: 0.5 }}>
          Tu carrito está vacío
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Agrega productos para comenzar tu compra.
        </Typography>
        <Button component={Link} to="/search" variant="contained" color="primary">
          Ver catálogo
        </Button>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h6" fontWeight={700} sx={{ color: '#282d35', mb: 3 }}>
        Carrito ({items.length} {items.length === 1 ? 'producto' : 'productos'})
      </Typography>

      <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Items */}
        <Box sx={{ flex: 1 }}>
          {items.map((item, i) => {
            const coverSrc = item.cover
              ? `data:image/jpeg;base64,${item.cover}`
              : item.coverUrl || 'https://placehold.co/80x80/ccc/333?text=Album'

            return (
              <Box key={item.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', py: 2, gap: 2 }}>
                  <img
                    src={coverSrc}
                    alt={item.nombre}
                    style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8 }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>{item.nombre}</Typography>
                    <Typography variant="caption" color="text.secondary">{item.artista} · {item.tipo}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#f5f5f5', borderRadius: 50, px: 0.5 }}>
                    <IconButton size="small" onClick={() => updateQty(item.id, item.qty - 1)}>
                      <RemoveIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                    <Typography variant="body2" sx={{ minWidth: 20, textAlign: 'center', fontWeight: 600 }}>{item.qty}</Typography>
                    <IconButton size="small" onClick={() => updateQty(item.id, item.qty + 1)}>
                      <AddIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" fontWeight={700} sx={{ minWidth: 80, textAlign: 'right' }}>
                    ${(item.precio * item.qty).toLocaleString('es-MX')}
                  </Typography>
                  <IconButton size="small" onClick={() => removeItem(item.id)} sx={{ color: '#9ca3af' }}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
                {i < items.length - 1 && <Divider />}
              </Box>
            )
          })}
        </Box>

        {/* Summary */}
        <Box sx={{
          width: { xs: '100%', md: 300 },
          bgcolor: '#fafafa',
          borderRadius: 3,
          p: 3,
          height: 'fit-content',
          border: '1px solid #f0f0f0'
        }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>Resumen</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">Subtotal</Typography>
            <Typography variant="body2">${total.toLocaleString('es-MX')}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">Envío</Typography>
            <Typography variant="body2">{shipping === 0 ? 'Gratis' : `$${shipping.toLocaleString('es-MX')}`}</Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="body1" fontWeight={700}>Total</Typography>
            <Typography variant="body1" fontWeight={700}>${(total + shipping).toLocaleString('es-MX')}</Typography>
          </Box>
          <Button component={Link} to="/checkout" variant="contained" color="primary" fullWidth sx={{ mb: 1.5 }}>
            Proceder al pago
          </Button>
          <Button onClick={clearCart} variant="text" size="small" fullWidth sx={{ color: '#9ca3af', fontSize: '0.75rem' }}>
            Vaciar carrito
          </Button>
        </Box>
      </Box>
    </Container>
  )
}

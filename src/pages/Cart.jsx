import { Link } from 'react-router-dom'
import { Container, Typography, Box, IconButton, Divider } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import { useCart } from '../context/CartContext'
import { BtnPrimary, BtnText } from '../components/ui/Buttons'
import { EmptyState, PageHeader } from '../components/ui'

export default function Cart() {
  const { items, updateQty, removeItem, total, shipping, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <EmptyState
          icon={<ShoppingBagOutlinedIcon sx={{ fontSize: 28 }} />}
          title="Tu carrito está vacío"
          subtitle="Agrega productos para comenzar tu compra."
          action={<BtnPrimary component={Link} to="/search">Ver catálogo</BtnPrimary>}
          sx={{ width: '100%' }}
        />
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <PageHeader
        title="Carrito"
        subtitle={`${items.length} ${items.length === 1 ? 'producto' : 'productos'}`}
      />

      <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Items */}
        <Box sx={{ flex: 1 }}>
          {items.map((item, i) => {
            const name = item.title || item.nombre
            const artist = item.artist || item.artista
            const type = item.variantLabel || item.type || item.tipo
            const price = item.price || item.precio || 0
            const coverSrc = item.cover_image || item.coverImage || (item.cover ? `data:image/jpeg;base64,${item.cover}` : null) || 'https://placehold.co/80x80/ccc/333?text=Album'
            const productLink = `/product/${item.slug || item.id}`

            return (
              <Box key={item.cartKey || item.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', py: 2, gap: 2 }}>
                  <Box component={Link} to={productLink} sx={{ flexShrink: 0 }}>
                    <img
                      src={coverSrc}
                      alt={name}
                      style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8 }}
                    />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography component={Link} to={productLink} variant="body2" fontWeight={600} noWrap sx={{ display: 'block', color: 'inherit', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>{name}</Typography>
                    <Typography variant="caption" color="text.secondary">{artist} — {type}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'grey.100', borderRadius: 50, px: 0.5 }}>
                    <IconButton size="small" onClick={() => updateQty(item.cartKey, item.qty - 1)}>
                      <RemoveIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                    <Typography variant="body2" sx={{ minWidth: 20, textAlign: 'center', fontWeight: 600 }}>{item.qty}</Typography>
                    <IconButton size="small" onClick={() => updateQty(item.cartKey, item.qty + 1)}>
                      <AddIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" fontWeight={700} sx={{ minWidth: 80, textAlign: 'right' }}>
                    ${(price * item.qty).toLocaleString('es-MX')}
                  </Typography>
                  <IconButton size="small" onClick={() => removeItem(item.cartKey)} sx={{ color: 'text.disabled' }}>
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
          bgcolor: 'grey.50',
          borderRadius: 3,
          p: 3,
          height: 'fit-content',
          border: '1px solid',
          borderColor: 'grey.200'
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
          <BtnPrimary component={Link} to="/checkout" fullWidth sx={{ mb: 1.5 }}>
            Proceder al pago
          </BtnPrimary>
          <BtnText muted onClick={clearCart} fullWidth sx={{ fontSize: '0.75rem' }}>
            Vaciar carrito
          </BtnText>
        </Box>
      </Box>
    </Container>
  )
}

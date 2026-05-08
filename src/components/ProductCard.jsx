import { Link } from 'react-router-dom'
import { Card, CardMedia, CardContent, Typography, Chip, Box, IconButton } from '@mui/material'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import { useCart } from '../context/CartContext'

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const coverSrc = product.cover
    ? `data:image/jpeg;base64,${product.cover}`
    : product.coverUrl || 'https://placehold.co/300x300/ccc/333?text=No+Image'

  const handleAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: product.id,
      nombre: product.nombre,
      artista: product.artista,
      tipo: product.tipo,
      cover: product.cover,
      coverUrl: product.coverUrl,
      precio: product.precioDescuento || product.precio,
      qty: 1
    })
  }

  return (
    <Card
      component={Link}
      to={`/product/${product.id}`}
      sx={{
        textDecoration: 'none',
        color: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        minWidth: 0,
        position: 'relative',
        border: 'none',
        boxShadow: 'none',
        bgcolor: 'transparent',
        borderRadius: 0,
        overflow: 'hidden',
        '&:hover': {
          boxShadow: 'none',
          transform: 'none',
        },
        '&:hover .product-overlay': { opacity: 1 },
        '&:hover .product-img': { transform: 'scale(1.03)' },
      }}
    >
      <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: 2, bgcolor: '#f5f5f5', width: '100%', paddingTop: '100%' }}>
        <Chip
          label={product.tipo}
          size="small"
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 2,
            fontWeight: 700,
            fontSize: '0.7rem',
            bgcolor: product.tipo === 'LP' ? '#282d35' : '#dc454d',
            color: '#fff',
          }}
        />
        {product.precioDescuento && (
          <Chip
            label={`-${Math.round((1 - product.precioDescuento / product.precioOriginal) * 100)}%`}
            size="small"
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              zIndex: 2,
              fontWeight: 700,
              fontSize: '0.7rem',
              bgcolor: '#dc454d',
              color: '#fff',
            }}
          />
        )}
        <CardMedia
          component="img"
          image={coverSrc}
          alt={product.nombre}
          className="product-img"
          sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease', display: 'block' }}
        />
        <Box
          className="product-overlay"
          sx={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            opacity: 0,
            transition: 'opacity 0.2s ease',
          }}
        >
          <IconButton
            onClick={handleAdd}
            size="small"
            sx={{ bgcolor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', '&:hover': { bgcolor: '#282d35', color: '#fff' }, transition: 'all 0.2s' }}
          >
            <AddShoppingCartIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>
      <CardContent sx={{ px: 0.5, pt: 1.5, pb: 0 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {product.artista}
        </Typography>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 0.3, lineHeight: 1.3, fontSize: '0.95rem' }} noWrap>
          {product.nombre}
        </Typography>
        <Box sx={{ mt: 0.8, display: 'flex', alignItems: 'baseline', gap: 1 }}>
          {product.precioDescuento ? (
            <>
              <Typography sx={{ textDecoration: 'line-through', color: '#aaa', fontSize: '0.78rem' }}>
                ${product.precioOriginal}
              </Typography>
              <Typography fontWeight={700} color="secondary" sx={{ fontSize: '0.9rem' }}>
                ${product.precioDescuento}
              </Typography>
            </>
          ) : (
            <Typography fontWeight={700} sx={{ color: '#282d35', fontSize: '0.9rem' }}>
              ${product.precio}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

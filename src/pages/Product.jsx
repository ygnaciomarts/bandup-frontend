import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Container, Typography, Button, Chip, Box, Skeleton, Alert, Breadcrumbs, IconButton, Rating, Divider, Avatar } from '@mui/material'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import CheckIcon from '@mui/icons-material/Check'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import FavoriteIcon from '@mui/icons-material/Favorite'
import StarIcon from '@mui/icons-material/Star'
import { api } from '../services/api'
import { useCart } from '../context/CartContext'

export default function Product() {
  const { id } = useParams()
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.getProduct(id),
  })

  const handleAddToCart = () => {
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
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', gap: { xs: 0, md: 5 }, flexDirection: { xs: 'column', md: 'row' } }}>
          <Skeleton variant="rounded" sx={{ width: { xs: '100%', md: 380 }, height: { xs: 320, md: 380 }, borderRadius: 3, flexShrink: 0 }} />
          <Box sx={{ flex: 1, mt: { xs: 3, md: 0 } }}>
            <Skeleton width="25%" height={24} />
            <Skeleton width="80%" height={36} sx={{ mt: 1 }} />
            <Skeleton width="40%" height={24} sx={{ mt: 1 }} />
            <Skeleton width="30%" height={40} sx={{ mt: 3 }} />
          </Box>
        </Box>
      </Container>
    )
  }

  if (isError || !product) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>Producto no encontrado</Alert>
      </Container>
    )
  }

  const coverSrc = product.cover
    ? `data:image/jpeg;base64,${product.cover}`
    : product.coverUrl || 'https://placehold.co/500x500/ccc/333?text=No+Image'

  const tracklist = Array.isArray(product.tracklist)
    ? product.tracklist
    : typeof product.tracklist === 'string'
      ? product.tracklist.split(/\r?\n/).map((t) => t.trim()).filter(Boolean)
      : []

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Breadcrumb */}
      <Breadcrumbs sx={{ mb: 3, fontSize: '0.8rem' }}>
        <Link to="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Inicio</Link>
        <Link to="/search" style={{ color: '#6b7280', textDecoration: 'none' }}>Catálogo</Link>
        <Typography variant="caption" color="text.primary" fontWeight={600}>{product.nombre}</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', gap: { xs: 0, md: 5 }, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Image */}
        <Box sx={{
          width: { xs: '100%', md: 380 },
          flexShrink: 0,
          borderRadius: 3,
          overflow: 'hidden',
          bgcolor: '#f5f5f5',
          alignSelf: 'flex-start',
          position: 'relative',
        }}>
          <img src={coverSrc} alt={product.nombre} style={{ width: '100%', display: 'block' }} />
          {/* Wishlist button on image */}
          <IconButton
            onClick={() => setWishlisted(!wishlisted)}
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              bgcolor: 'rgba(255,255,255,0.9)',
              '&:hover': { bgcolor: '#fff' },
            }}
          >
            {wishlisted
              ? <FavoriteIcon sx={{ color: '#dc454d' }} />
              : <FavoriteBorderIcon sx={{ color: '#282d35' }} />
            }
          </IconButton>
        </Box>

        {/* Details */}
        <Box sx={{ flex: 1, mt: { xs: 3, md: 0 } }}>
          <Chip
            label={product.tipo}
            size="small"
            sx={{
              mb: 1.5,
              fontWeight: 600,
              fontSize: '0.7rem',
              bgcolor: product.tipo === 'LP' ? '#282d35' : '#f5f5f5',
              color: product.tipo === 'LP' ? '#fff' : '#282d35',
            }}
          />

          <Typography variant="h5" component="h1" fontWeight={700} sx={{ color: '#282d35', lineHeight: 1.3 }}>
            {product.nombre}
          </Typography>

          <Typography variant="body1" sx={{ color: '#6b7280', mt: 0.5 }}>
            {product.artista}
          </Typography>

          {/* Rating inline */}
          {product.rating != null && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
              <Rating value={product.rating} precision={0.5} readOnly size="small" />
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                {product.rating} ({product.totalReviews} reseñas)
              </Typography>
            </Box>
          )}

          {/* Price */}
          <Box sx={{ mt: 3, mb: 3 }}>
            {product.precioDescuento ? (
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
                <Typography variant="h5" fontWeight={700} sx={{ color: '#282d35' }}>
                  ${product.precioDescuento.toLocaleString('es-MX')}
                </Typography>
                <Typography variant="body1" sx={{ textDecoration: 'line-through', color: '#9ca3af' }}>
                  ${product.precioOriginal.toLocaleString('es-MX')}
                </Typography>
              </Box>
            ) : (
              <Typography variant="h5" fontWeight={700} sx={{ color: '#282d35' }}>
                ${product.precio.toLocaleString('es-MX')}
              </Typography>
            )}
          </Box>

          {/* Stock */}
          <Typography variant="body2" sx={{ color: product.existencias > 0 ? '#059669' : '#dc454d', mb: 3, fontWeight: 500 }}>
            {product.existencias > 0 ? `${product.existencias} disponibles` : 'Agotado'}
          </Typography>

          {/* Add to cart + Wishlist */}
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Button
              variant="contained"
              color={added ? 'success' : 'primary'}
              startIcon={added ? <CheckIcon /> : <ShoppingBagOutlinedIcon />}
              onClick={handleAddToCart}
              disabled={product.existencias <= 0}
              sx={{ px: 4 }}
            >
              {added ? 'Agregado' : 'Agregar al carrito'}
            </Button>
            <IconButton
              onClick={() => setWishlisted(!wishlisted)}
              sx={{
                border: '1px solid #e5e7eb',
                borderRadius: 50,
                '&:hover': { borderColor: '#282d35' },
              }}
            >
              {wishlisted
                ? <FavoriteIcon sx={{ color: '#dc454d' }} />
                : <FavoriteBorderIcon sx={{ color: '#6b7280' }} />
              }
            </IconButton>
          </Box>

          {/* Género */}
          {product.genero && (
            <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #f0f0f0' }}>
              <Typography variant="caption" sx={{ color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
                Género
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, color: '#282d35' }}>
                {product.genero}
              </Typography>
            </Box>
          )}

          {/* Description */}
          {product.descripcion && (
            <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #f0f0f0' }}>
              <Typography variant="caption" sx={{ color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
                Descripción
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: '#4b5563', lineHeight: 1.7 }}>
                {product.descripcion}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Tracklist */}
      {tracklist.length > 0 && (
        <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid #f0f0f0' }}>
          <Typography variant="h6" fontWeight={700} sx={{ color: '#282d35', mb: 2 }}>
            Tracklist
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 0 }}>
            {tracklist.map((track, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.2, px: 1, borderBottom: '1px solid #f9fafb' }}>
                <Typography variant="body2" sx={{ color: '#9ca3af', fontWeight: 600, minWidth: 24, textAlign: 'right' }}>
                  {String(idx + 1).padStart(2, '0')}
                </Typography>
                <Typography variant="body2" sx={{ color: '#282d35' }}>
                  {track}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Reviews */}
      {product.reviews && product.reviews.length > 0 && (
        <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid #f0f0f0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ color: '#282d35' }}>
              Reseñas
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StarIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
              <Typography variant="body1" fontWeight={700} sx={{ color: '#282d35' }}>
                {product.rating}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                / 5 · {product.totalReviews} reseñas
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {product.reviews.map((review) => (
              <Box key={review.id} sx={{ p: 2.5, border: '1px solid #f0f0f0', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#282d35', fontSize: '0.75rem' }}>
                    {review.usuario.charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ color: '#282d35' }}>
                      {review.usuario}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                      {new Date(review.fecha).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </Typography>
                  </Box>
                  <Rating value={review.rating} readOnly size="small" />
                </Box>
                <Typography variant="body2" sx={{ color: '#4b5563', lineHeight: 1.6 }}>
                  {review.comentario}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Container>
  )
}

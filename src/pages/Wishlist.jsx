import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Container, Typography, Box, IconButton, Skeleton, Chip, ToggleButtonGroup, ToggleButton, Button
} from '@mui/material'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import FavoriteIcon from '@mui/icons-material/Favorite'
import ViewModuleIcon from '@mui/icons-material/ViewModule'
import ViewListIcon from '@mui/icons-material/ViewList'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import { api } from '../services/api'
import ProductCard from '../components/ProductCard'
import { BtnPrimary } from '../components/ui/Buttons'
import { EmptyState, PageHeader } from '../components/ui'
import { useCart } from '../context/CartContext'

export default function Wishlist() {
  const queryClient = useQueryClient()
  const { addItem } = useCart()
  const [view, setView] = useState('grid')

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => api.getWishlist(),
  })

  const removeMutation = useMutation({
    mutationFn: ({ productId, variantId }) => api.removeFromWishlist(productId, variantId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  })

  const formatPrice = (v) => Number(v).toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0, maximumFractionDigits: 0 })

  const handleAddToCart = (product) => {
    addItem({
      id: product.id,
      variantId: product.variant_id,
      variantLabel: product.variant_label ? `${product.variant_type || ''} (${product.variant_label})` : product.variant_type,
      title: product.title,
      artist: product.artist,
      type: product.variant_type || product.type,
      cover_image: product.cover_image,
      price: product.price_final || product.price,
      qty: 1,
    })
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <PageHeader title="Mi Wishlist" />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5 }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Box key={i} sx={{ width: { xs: 'calc(50% - 10px)', sm: 'calc(33.33% - 14px)', md: 'calc(25% - 15px)' } }}>
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

  if (items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <EmptyState
          icon={<FavoriteBorderIcon sx={{ fontSize: 28 }} />}
          title="Tu wishlist está vacía"
          subtitle="Explora nuestro catálogo y guarda tus favoritos."
          action={<BtnPrimary component={Link} to="/search">Explorar catálogo</BtnPrimary>}
        />
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <PageHeader
        title="Mi Wishlist"
        subtitle={`${items.length} ${items.length === 1 ? 'producto' : 'productos'}`}
        action={
          <ToggleButtonGroup value={view} exclusive onChange={(_, v) => v && setView(v)} size="small">
            <ToggleButton value="grid" aria-label="Vista cuadrícula" sx={{ px: 1.2 }}><ViewModuleIcon sx={{ fontSize: 18 }} /></ToggleButton>
            <ToggleButton value="list" aria-label="Vista lista" sx={{ px: 1.2 }}><ViewListIcon sx={{ fontSize: 18 }} /></ToggleButton>
          </ToggleButtonGroup>
        }
      />

      {view === 'grid' ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5 }}>
          {items.map((product, idx) => (
            <Box key={`${product.id}_${product.variant_id || idx}`} sx={{ width: { xs: 'calc(50% - 10px)', sm: 'calc(33.33% - 14px)', md: 'calc(25% - 15px)' }, position: 'relative' }}>
              <ProductCard product={product} linkState={{ from: '/wishlist', fromLabel: 'Wishlist' }} stock={product.stock} />
              <IconButton
                size="small"
                onClick={() => removeMutation.mutate({ productId: product.id, variantId: product.variant_id })}
                sx={{
                  position: 'absolute', top: 8, right: 8, zIndex: 5,
                  bgcolor: 'background.paper', boxShadow: 1,
                  '&:hover': { bgcolor: 'error.main', color: '#fff' },
                }}
              >
                <FavoriteIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
              </IconButton>
            </Box>
          ))}
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {items.map((product, idx) => {
            const precio = Number(product.price_final || product.price || 0)
            const precioOriginal = Number(product.price_original || precio)
            const hasDiscount = precioOriginal > precio
            const imgSrc = product.cover_image || product.coverImage || 'https://placehold.co/80x80/ccc/333?text=No+Img'
            const productUrl = product.variant_id && product.variant_type
              ? `/product/${product.slug || product.id}?variant=${product.variant_type.toLowerCase()}`
              : `/product/${product.slug || product.id}`

            return (
              <Box key={`${product.id}_${product.variant_id || idx}`}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 2, p: 1.5,
                  borderRadius: 2, border: '1px solid #f0f0f0', bgcolor: '#fff',
                  transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }
                }}>
                <Box component={Link} to={productUrl} state={{ from: '/wishlist', fromLabel: 'Wishlist', variantId: product.variant_id }}
                  sx={{ width: 80, height: 80, borderRadius: 1.5, overflow: 'hidden', flexShrink: 0, bgcolor: 'grey.100' }}>
                  <img src={imgSrc} alt={product.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
                    {product.variant_type && (
                      <Chip label={product.variant_type} size="small" sx={{ fontWeight: 700, fontSize: '0.6rem', height: 18 }} />
                    )}
                    {product.variant_label && (
                      <Typography variant="caption" sx={{ color: '#6b7280' }}>{product.variant_label}</Typography>
                    )}
                  </Box>
                  <Typography variant="body2" fontWeight={600} noWrap component={Link} to={productUrl}
                    state={{ from: '/wishlist', fromLabel: 'Wishlist', variantId: product.variant_id }}
                    sx={{ textDecoration: 'none', color: 'inherit', display: 'block', '&:hover': { color: 'primary.main' } }}>
                    {product.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">{product.artist}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    {hasDiscount && (
                      <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'text.disabled' }}>
                        {formatPrice(precioOriginal)}
                      </Typography>
                    )}
                    <Typography variant="body2" fontWeight={700} color={hasDiscount ? 'secondary' : 'text.primary'}>
                      {formatPrice(precio)}
                    </Typography>
                    {hasDiscount && (
                      <Chip label={`-${Math.round((1 - precio / precioOriginal) * 100)}%`} size="small"
                        sx={{ fontWeight: 700, fontSize: '0.6rem', height: 18, bgcolor: 'secondary.main', color: '#fff' }} />
                    )}
                  </Box>
                  {product.stock > 0 && product.stock <= 10 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.5 }}>
                      <LocalFireDepartmentIcon sx={{ fontSize: 12, color: '#ef4444' }} />
                      <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 700, fontSize: '0.65rem' }}>
                        ¡{product.stock === 1 ? 'Queda 1 unidad' : `Quedan ${product.stock} unidades`}!
                      </Typography>
                    </Box>
                  )}
                  {product.stock === 0 && (
                    <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 600, mt: 0.5, display: 'block' }}>
                      Agotado
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center', flexShrink: 0 }}>
                  <Button size="small" variant="contained" onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    startIcon={<AddShoppingCartIcon sx={{ fontSize: 14 }} />}
                    sx={{ textTransform: 'none', fontSize: '0.72rem', fontWeight: 600, borderRadius: 2, px: 1.5, whiteSpace: 'nowrap' }}>
                    Agregar
                  </Button>
                  <IconButton size="small" onClick={() => removeMutation.mutate({ productId: product.id, variantId: product.variant_id })}
                    sx={{ color: 'secondary.main', '&:hover': { color: 'error.main' } }}>
                    <FavoriteIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              </Box>
            )
          })}
        </Box>
      )}
    </Container>
  )
}

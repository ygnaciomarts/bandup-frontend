import { useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Box,
  IconButton
} from '@mui/material'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import { useCart } from '../context/CartContext'

export default function ProductCard({ product, linkState, stock }) {
  const { addItem } = useCart()
  const swiperRef = useRef(null)
  const [hovered, setHovered] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const FALLBACK_IMG = 'https://placehold.co/300x300/ccc/333?text=No+Image'

  const isAlbumMode = product.variants?.length > 0 && !product.variant_id

  // Album cover (always the main image base)
  const albumCover = product.cover_image || product.coverImage || product.coverUrl || product.imageUrl || product.image || FALLBACK_IMG

  // Variant covers only for arrow navigation
  const coverVariants = isAlbumMode
    ? product.variants.filter(v => v.cover_image && v.cover_image !== albumCover)
    : []
  const hasMultipleCovers = coverVariants.length > 0

  // activeIdx tracks which variant slide is shown (0-based within coverVariants)
  const activeVariant = hasMultipleCovers && hovered ? coverVariants[activeIdx] || coverVariants[0] : null

  // Album data
  const formats = isAlbumMode ? [...new Set(product.variants.map(v => v.type))].filter(Boolean) : []
  const totalVariants = isAlbumMode ? product.variants.length : 0

  // Pricing — cheapest variant for "Desde", active variant when browsing
  const cheapestVariant = isAlbumMode
    ? product.variants.reduce((min, v) => v.price_final < min.price_final ? v : min, product.variants[0])
    : null
  const displayVariant = activeVariant || cheapestVariant
  const precio = isAlbumMode ? displayVariant.price_final : Number(product.price_final || 0)
  const precioOriginal = isAlbumMode
    ? (displayVariant.price_original || displayVariant.price_final)
    : Number(product.price_original || precio)
  const hasDiscount = precioOriginal > precio
  const prices = isAlbumMode ? product.variants.map(v => v.price_final).filter(Boolean) : []
  const minPrice = prices.length ? Math.min(...prices) : precio
  const maxPrice = prices.length ? Math.max(...prices) : precio
  const hasRange = !activeVariant && minPrice !== maxPrice

  const formatPrice = (v) => Number(v).toLocaleString('es-MX', {
    style: 'currency', currency: 'MXN', minimumFractionDigits: 0, maximumFractionDigits: 0,
  })

  // Build variant URL param matching Product.jsx logic
  const buildVariantParam = (v) => {
    if (!v?.type || !product.variants) return ''
    const allVariants = product.variants
    const idx = allVariants.indexOf(v)
    const sameType = allVariants.filter(vv => vv.type === v.type).length > 1
    return `${v.type.toLowerCase()}${sameType ? '-' + (idx + 1) : ''}`
  }

  const baseUrl = `/product/${product.slug || product.id}`
  const productUrl = activeVariant
    ? `${baseUrl}?variant=${buildVariantParam(activeVariant)}`
    : isAlbumMode
      ? baseUrl
      : product.variant_id && product.variant_type
        ? `${baseUrl}?variant=${product.variant_type.toLowerCase()}`
        : baseUrl

  const linkStateObj = activeVariant
    ? { ...linkState, variantId: activeVariant.id }
    : product.variant_id
      ? { ...linkState, variantId: product.variant_id }
      : linkState

  const handleAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const v = activeVariant || cheapestVariant
    addItem({
      id: product.id,
      variantId: v?.id || product.variant_id,
      variantLabel: v
        ? (v.label ? `${v.type} (${v.label})` : v.type)
        : product.variant_type,
      title: product.title,
      artist: product.artist,
      type: v?.type || product.variant_type || product.type,
      cover_image: product.cover_image,
      price: v?.price_final || precio,
      qty: 1,
    })
  }

  // Arrow handlers — cycle within variant slides using Swiper slide effect
  const handlePrev = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    swiperRef.current?.slidePrev()
  }, [])

  const handleNext = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    swiperRef.current?.slideNext()
  }, [])

  const handleMouseEnter = () => {
    if (hasMultipleCovers) setHovered(true)
  }
  const handleMouseLeave = () => {
    if (hasMultipleCovers) {
      setHovered(false)
      swiperRef.current?.slideTo(0, 0)
      setActiveIdx(0)
    }
  }

  return (
    <Card
      component={Link}
      to={productUrl}
      state={linkStateObj}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        textDecoration: 'none', color: 'inherit',
        display: 'flex', flexDirection: 'column',
        height: '100%', width: '100%', minWidth: 0,
        position: 'relative',
        border: 'none', boxShadow: 'none', bgcolor: 'transparent',
        borderRadius: 0, overflow: 'hidden',
        '&:hover': { boxShadow: 'none', transform: 'none' },
        '&:hover .product-overlay': { opacity: 1 },
        '&:hover .product-img': !hasMultipleCovers ? { transform: 'scale(1.03)' } : {},
        '&:hover .product-nav': { opacity: 1 },
      }}
    >
      <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: 2, bgcolor: 'grey.100', width: '100%', paddingTop: '100%' }}>
        {/* Format pills — album mode: show active variant type or all formats */}
        {isAlbumMode && (
          <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 3, display: 'flex', gap: 0.4, flexWrap: 'wrap' }}>
            {activeVariant ? (
              <Chip label={activeVariant.label ? `${activeVariant.type} · ${activeVariant.label}` : activeVariant.type}
                size="small" sx={{
                  fontWeight: 700, fontSize: '0.6rem', height: 20, minWidth: 0,
                  bgcolor: 'rgba(40,45,53,0.85)', color: '#fff', backdropFilter: 'blur(4px)',
                }} />
            ) : formats.length > 0 && formats.map(f => (
              <Chip key={f} label={f} size="small" sx={{
                fontWeight: 700, fontSize: '0.6rem', height: 20, minWidth: 0,
                bgcolor: 'rgba(40,45,53,0.85)', color: '#fff', backdropFilter: 'blur(4px)',
              }} />
            ))}
          </Box>
        )}

        {/* Single type chip — variant mode */}
        {!isAlbumMode && product.type && (
          <Chip label={product.type} size="small" sx={{
            position: 'absolute', top: 10, left: 10, zIndex: 2,
            fontWeight: 700, fontSize: '0.7rem',
            bgcolor: product.type === 'VINYL' ? 'primary.main' : 'secondary.main',
            color: 'primary.contrastText',
          }} />
        )}

        {/* Discount badge */}
        {hasDiscount && (
          <Chip
            label={`-${Math.round((1 - precio / precioOriginal) * 100)}%`}
            size="small"
            sx={{
              position: 'absolute', top: 10, right: 10, zIndex: 2,
              fontWeight: 700, fontSize: '0.7rem',
              bgcolor: 'secondary.main', color: 'secondary.contrastText',
            }}
          />
        )}

        {/* Swiper for variant covers (slide effect) — behind album cover */}
        {hasMultipleCovers && (
          <Swiper
            onSwiper={(sw) => { swiperRef.current = sw }}
            onSlideChange={(sw) => setActiveIdx(sw.activeIndex)}
            loop
            speed={300}
            allowTouchMove={false}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}
          >
            {coverVariants.map((v, i) => (
              <SwiperSlide key={i}>
                <CardMedia
                  component="img"
                  image={v.cover_image}
                  alt={`${product.title} - ${v.type}`}
                  loading="lazy"
                  onError={(e) => { if (e.target.src !== FALLBACK_IMG) e.target.src = FALLBACK_IMG }}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {/* Album cover — static overlay that fades out on hover */}
        <CardMedia
          component="img"
          image={albumCover}
          alt={product.title}
          className="product-img"
          loading="lazy"
          onError={(e) => { if (e.target.src !== FALLBACK_IMG) e.target.src = FALLBACK_IMG }}
          sx={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            objectFit: 'cover', zIndex: 2,
            transition: 'opacity 0.5s ease, transform 0.3s ease',
            opacity: hovered ? 0 : 1,
            display: 'block',
          }}
        />

        {/* Arrow navigation — album mode with multiple covers */}
        {hasMultipleCovers && (
          <>
            <IconButton className="product-nav" onClick={handlePrev} size="small" aria-label="Anterior" sx={{
              position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)', zIndex: 6,
              bgcolor: 'rgba(255,255,255,0.85)', opacity: 0, transition: 'opacity 0.2s',
              width: 26, height: 26,
              '&:hover': { bgcolor: '#fff' },
            }}>
              <ChevronLeftIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <IconButton className="product-nav" onClick={handleNext} size="small" aria-label="Siguiente" sx={{
              position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', zIndex: 6,
              bgcolor: 'rgba(255,255,255,0.85)', opacity: 0, transition: 'opacity 0.2s',
              width: 26, height: 26,
              '&:hover': { bgcolor: '#fff' },
            }}>
              <ChevronRightIcon sx={{ fontSize: 16 }} />
            </IconButton>
            {/* Dots indicator — variant slides only (exclude album cover dot) */}
            <Box sx={{
              position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)', zIndex: 6,
              display: 'flex', gap: 0.5, opacity: 0, transition: 'opacity 0.2s',
            }} className="product-nav">
              {coverVariants.map((_, i) => (
                <Box key={i} sx={{
                  width: 5, height: 5, borderRadius: '50%',
                  bgcolor: activeIdx === i ? '#fff' : 'rgba(255,255,255,0.5)',
                  transition: 'background-color 0.2s',
                }} />
              ))}
            </Box>
          </>
        )}

        {/* Hover overlay — album mode (gradient with info) */}
        {isAlbumMode && (
          <Box className="product-overlay" sx={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.25) 65%, transparent 100%)',
            opacity: 0, transition: 'opacity 0.3s ease', zIndex: 5,
            p: 1.5, pt: 5, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 0.3,
          }}>
            {totalVariants > 1 && (
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.68rem', fontWeight: 500 }}>
                {totalVariants} versiones disponibles
              </Typography>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <IconButton onClick={handleAdd} size="small" sx={{
                bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(4px)',
                '&:hover': { bgcolor: 'primary.main' }, transition: 'all 0.2s',
              }}>
                <AddShoppingCartIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </Box>
        )}

        {/* Hover overlay — variant mode (simple cart button) */}
        {!isAlbumMode && (
          <Box className="product-overlay" sx={{
            position: 'absolute', bottom: 10, right: 10,
            opacity: 0, transition: 'opacity 0.2s ease',
          }}>
            <IconButton onClick={handleAdd} size="small" sx={{
              bgcolor: 'background.paper', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              '&:hover': { bgcolor: 'primary.main', color: 'primary.contrastText' },
              transition: 'all 0.2s',
            }}>
              <AddShoppingCartIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Card content */}
      <CardContent sx={{ px: 0.5, pt: 1.5, pb: 0 }}>
        <Typography variant="body2" color="text.secondary"
          sx={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {product.artist || 'Artista desconocido'}
        </Typography>

        <Typography variant="subtitle2" fontWeight={600}
          sx={{ mt: 0.3, lineHeight: 1.3, fontSize: '0.95rem' }} noWrap>
          {!isAlbumMode && product.variant_label
            ? `${product.title} (${product.variant_label})`
            : product.title}
        </Typography>

        <Box sx={{ mt: 0.8, display: 'flex', alignItems: 'baseline', gap: 1 }}>
          {hasDiscount ? (
            <>
              <Typography sx={{ textDecoration: 'line-through', color: 'text.disabled', fontSize: '0.78rem' }}>
                {formatPrice(precioOriginal)}
              </Typography>
              <Typography fontWeight={700} color="secondary" sx={{ fontSize: '0.9rem' }}>
                {hasRange ? `Desde ${formatPrice(minPrice)}` : formatPrice(precio)}
              </Typography>
            </>
          ) : (
            <Typography fontWeight={700} sx={{ color: 'text.primary', fontSize: '0.9rem' }}>
              {hasRange ? `Desde ${formatPrice(minPrice)}` : formatPrice(precio)}
            </Typography>
          )}
        </Box>

        {/* Stock indicator */}
        {stock != null && stock > 0 && stock <= 10 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.6 }}>
            <LocalFireDepartmentIcon sx={{ fontSize: 12, color: '#ef4444' }} />
            <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 700, fontSize: '0.68rem' }}>
              ¡{stock === 1 ? 'Queda 1 unidad' : `Quedan ${stock} unidades`}!
            </Typography>
          </Box>
        )}
        {stock === 0 && (
          <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 600, fontSize: '0.68rem', mt: 0.6, display: 'block' }}>
            Agotado
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}
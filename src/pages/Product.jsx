import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useSearchParams, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Container,
  Typography,
  Chip,
  Box,
  Skeleton,
  Alert,
  Breadcrumbs,
  IconButton,
  Rating,
  Avatar,
  TextField,
  LinearProgress,
  Collapse,
  Popover,
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material'

import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import CheckIcon from '@mui/icons-material/Check'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import FavoriteIcon from '@mui/icons-material/Favorite'
import StarIcon from '@mui/icons-material/Star'
import VerifiedIcon from '@mui/icons-material/Verified'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined'
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined'
import CloseIcon from '@mui/icons-material/Close'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'

import { api } from '../services/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import { BtnPrimary, BtnAuth, BtnOutlined } from '../components/ui/Buttons'
import SEO from '../components/SEO'
import ProductCard from '../components/ProductCard'
import { addToRecentlyViewed, getRecentlyViewedIds, getRecentlyViewed } from '../utils/recentlyViewed'
import DOMPurify from 'dompurify'

export default function Product() {
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const { addItem } = useCart()
  const { user } = useAuth()
  const { notify } = useNotification()
  const queryClient = useQueryClient()

  const [added, setAdded] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0)
  const [showDescription, setShowDescription] = useState(true)
  const [showTracklist, setShowTracklist] = useState(true)
  const [showShareModal, setShowShareModal] = useState(false)
  const gallerySwiperRef = useRef(null)
  const addToCartRef = useRef(null)

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => api.getProduct(slug),
  })

  // Build variant URL param: 'lp' if unique type, 'lp-1' if duplicates
  const buildVariantParam = (variants, idx) => {
    const v = variants[idx]
    const sameType = variants.filter(vv => vv.type === v.type).length > 1
    return `${v.type.toLowerCase()}${sameType ? '-' + (idx + 1) : ''}`
  }

  // Sync variant from URL param (?variant=lp-1) or navigation state (variantId)
  useEffect(() => {
    if (!product?.variants?.length) return
    // 1. Check navigation state for exact variant ID (from wishlist, etc.)
    const stateVid = location.state?.variantId
    if (stateVid) {
      const idx = product.variants.findIndex(v => v.id === parseInt(stateVid))
      if (idx >= 0 && idx !== selectedVariantIdx) {
        setSelectedVariantIdx(idx)
        setSearchParams({ variant: buildVariantParam(product.variants, idx) }, { replace: true })
        return
      }
    }
    // 2. Check URL param ?variant=lp or ?variant=lp-1
    const variantParam = searchParams.get('variant')
    if (variantParam) {
      const match = variantParam.match(/^([a-z]+)(?:-([0-9]+))?$/i)
      if (match) {
        const type = match[1].toUpperCase()
        const explicitIdx = match[2] !== undefined ? parseInt(match[2]) - 1 : null
        if (explicitIdx !== null && explicitIdx >= 0 && product.variants[explicitIdx]?.type === type) {
          if (explicitIdx !== selectedVariantIdx) setSelectedVariantIdx(explicitIdx)
        } else {
          const idx = product.variants.findIndex(v => v.type.toUpperCase() === type)
          if (idx >= 0 && idx !== selectedVariantIdx) setSelectedVariantIdx(idx)
        }
      }
    }
  }, [product, searchParams, location.state])

  // Track recently viewed products
  useEffect(() => {
    if (product?.id) addToRecentlyViewed(product.id)
  }, [product?.id])

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', product?.id],
    queryFn: () => api.getReviews(product.id),
    enabled: !!product?.id,
  })

  // Wishlist check - depends on selected variant
  const currentVariantId = product?.variants?.[selectedVariantIdx]?.id
  const { data: wishData } = useQuery({
    queryKey: ['wishlist', 'check', product?.id, currentVariantId],
    queryFn: () => api.checkWishlist(product.id, currentVariantId),
    enabled: !!user && !!product?.id,
  })

  const wishlistMutation = useMutation({
    mutationFn: () => wishlisted
      ? api.removeFromWishlist(product.id, currentVariantId)
      : api.addToWishlist(product.id, currentVariantId),
    onSuccess: () => {
      const newState = !wishlisted
      setWishlisted(newState)
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      const sv = product.variants?.[selectedVariantIdx]
      const edition = sv ? (sv.label ? `${sv.type} — ${sv.label}` : sv.type) : ''
      let desc = `${product.title}${edition ? ` - ${edition}` : ''}`
      if (desc.length > 40) desc = desc.slice(0, 40) + '…'
      desc = `"${desc}" de ${product.artist}`
      notify(newState ? `${desc} se agregó a tu wishlist` : `${desc} se removió de tu wishlist`, 'success')
    },
    onError: () => notify('Inicia sesión para usar la wishlist', 'warning'),
  })

  // Set wishlisted state from server
  useEffect(() => {
    if (wishData) setWishlisted(wishData.inWishlist)
  }, [wishData])

  const handleAddToCart = () => {
    const variant = product.variants?.[selectedVariantIdx]
    const variantLabel = variant ? (variant.label ? `${variant.type} (${variant.label})` : variant.type) : product.type
    addItem({
      id: product.id,
      slug: product.slug,
      variantId: variant?.id,
      variantLabel,
      title: product.title,
      artist: product.artist,
      type: variant?.type || product.type,
      cover_image: variant?.cover_image || product.cover_image,
      price: variant?.price_final || product.price_final || product.price,
      qty: 1,
    })

    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleShare = async (type) => {
    const url = window.location.href
    const text = `¡Mira lo que encontré en BandUp! ${product.title} - ${product.artist}`
    if (type === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`, '_blank')
    } else if (type === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
    } else {
      await navigator.clipboard.writeText(url)
      notify('Enlace copiado al portapapeles', 'success')
    }
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Breadcrumb skeleton */}
        <Skeleton width={200} height={16} sx={{ mb: 2 }} />
        <Box
          sx={{
            display: 'flex',
            gap: { xs: 0, md: 5 },
            flexDirection: { xs: 'column', md: 'row' },
          }}
        >
          {/* Image */}
          <Skeleton
            variant="rounded"
            sx={{
              width: { xs: '100%', md: 420 },
              height: { xs: 340, md: 420 },
              borderRadius: 3,
              flexShrink: 0,
            }}
          />

          {/* Details */}
          <Box sx={{ flex: 1, mt: { xs: 3, md: 0 } }}>
            <Skeleton width="20%" height={16} sx={{ mb: 1 }} />
            <Skeleton width="70%" height={32} sx={{ mb: 0.5 }} />
            <Skeleton width="40%" height={22} sx={{ mb: 2 }} />
            <Skeleton width="25%" height={36} sx={{ mb: 3 }} />
            {/* Variant pills */}
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <Skeleton variant="rounded" width={60} height={32} sx={{ borderRadius: 50 }} />
              <Skeleton variant="rounded" width={60} height={32} sx={{ borderRadius: 50 }} />
            </Box>
            {/* Add to cart button */}
            <Skeleton variant="rounded" width="100%" height={48} sx={{ borderRadius: 50, mb: 2 }} />
            {/* Trust badges */}
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Skeleton variant="rounded" width={100} height={40} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rounded" width={100} height={40} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rounded" width={100} height={40} sx={{ borderRadius: 1 }} />
            </Box>
          </Box>
        </Box>
      </Container>
    )
  }

  if (isError || !product) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Producto no encontrado
        </Alert>
      </Container>
    )
  }

  const productCover = product.cover_image || 'https://placehold.co/500x500/ccc/333?text=No+Image'

  // Use variant cover if available, otherwise fall back to product cover
  const selectedVariant = product.variants?.[selectedVariantIdx]
  const coverSrc = selectedVariant?.cover_image || productCover

  // Build image gallery: variant cover (or product cover), then additional images
  const variantImages = (product.images || []).filter(img => img.variant_id === selectedVariant?.id)
  const generalImages = (product.images || []).filter(img => !img.variant_id)
  const allImages = [
    { url: coverSrc, alt: product.title },
    ...variantImages.map(img => ({ url: img.url, alt: img.alt || product.title })),
    ...generalImages.map(img => ({ url: img.url, alt: img.alt || product.title })),
  ]

  const variantTracklist = selectedVariant?.tracklist || product.tracklist || null
  const tracklistRaw = Array.isArray(variantTracklist)
    ? variantTracklist
    : typeof variantTracklist === 'string'
      ? variantTracklist
        .split(/\r?\n/)
        .map((t) => t.trim())
        .filter(Boolean)
      : []

  // Parse into sides: detect "Side X" / "Lado X" lines as headers
  const sideRegex = /^(side|lado)\s+.+$/i
  const tracklistParsed = (() => {
    const sections = []
    let current = { side: null, tracks: [] }
    for (const line of tracklistRaw) {
      if (sideRegex.test(line)) {
        if (current.tracks.length > 0 || current.side) sections.push(current)
        current = { side: line, tracks: [] }
      } else {
        current.tracks.push(line.replace(/^\d+[\.\)\-]\s*/, ''))
      }
    }
    if (current.tracks.length > 0 || current.side) sections.push(current)
    return sections
  })()

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <SEO
        title={`${product.title} - ${product.artist}`}
        description={`${product.title} de ${product.artist}. Compra en BandUp.`}
        image={product.cover_image}
        type="product"
      />
      {/* Breadcrumb */}
      <Breadcrumbs sx={{ mb: 3, fontSize: '0.82rem' }}>
        <Link
          to={location.state?.from || '/search'}
          style={{ color: '#6b7280', textDecoration: 'none' }}
        >
          {location.state?.fromLabel || 'Catálogo'}
        </Link>

        {product.genre && (
          <Link
            to={`/search?genre=${encodeURIComponent(product.genre)}`}
            style={{ color: '#6b7280', textDecoration: 'none' }}
          >
            {product.genre}
          </Link>
        )}

        <Typography
          variant="body2"
          color="text.primary"
          fontWeight={600}
          sx={{ fontSize: '0.82rem' }}
        >
          {product.title}
        </Typography>
      </Breadcrumbs>

      <Box
        sx={{
          display: 'flex',
          gap: { xs: 0, md: 5 },
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        {/* Image Gallery */}
        <Box
          sx={{
            width: { xs: '100%', md: 420 },
            flexShrink: 0,
            alignSelf: 'flex-start',
            position: { md: 'sticky' },
            top: { md: 'calc(var(--header-height, 80px) + 16px)' },
          }}
        >
          <Box
            sx={{
              borderRadius: 3,
              bgcolor: 'grey.100',
              position: 'relative',
              mb: 1.5,
            }}
          >
            <Box sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Swiper
              modules={[Navigation]}
              navigation={{
                prevEl: '.product-swiper-prev',
                nextEl: '.product-swiper-next',
              }}
              loop={allImages.length > 1}
              style={{ width: '100%', aspectRatio: '1' }}
              onSwiper={(swiper) => { gallerySwiperRef.current = swiper }}
              onSlideChange={(swiper) => setSelectedImage(swiper.realIndex)}
            >
              {allImages.map((img, idx) => (
                <SwiperSlide key={idx}>
                  <Zoom zoomMargin={40}>
                    <img
                      src={img.url || coverSrc}
                      alt={img.alt || product.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  </Zoom>
                </SwiperSlide>
              ))}
            </Swiper>
            </Box>

            {/* Custom navigation arrows */}
            {allImages.length > 1 && (
              <>
                <IconButton
                  className="product-swiper-prev"
                  sx={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', zIndex: 10, bgcolor: 'rgba(255,255,255,0.9)', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', width: 36, height: 36, '&:hover': { bgcolor: '#fff' } }}
                >
                  <ChevronLeftIcon sx={{ fontSize: 20, color: '#282d35' }} />
                </IconButton>
                <IconButton
                  className="product-swiper-next"
                  sx={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', zIndex: 10, bgcolor: 'rgba(255,255,255,0.9)', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', width: 36, height: 36, '&:hover': { bgcolor: '#fff' } }}
                >
                  <ChevronRightIcon sx={{ fontSize: 20, color: '#282d35' }} />
                </IconButton>
              </>
            )}
          </Box>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5 }}>
              {allImages.map((img, idx) => (
                <Box
                  key={idx}
                  onClick={() => { setSelectedImage(idx); gallerySwiperRef.current?.slideToLoop(idx) }}
                  sx={{
                    width: 64, height: 64, borderRadius: 1.5,
                    overflow: 'hidden', cursor: 'pointer', flexShrink: 0,
                    border: '2px solid',
                    borderColor: idx === selectedImage ? 'primary.main' : 'transparent',
                    opacity: idx === selectedImage ? 1 : 0.6,
                    transition: 'all 0.2s',
                    '&:hover': { opacity: 1 },
                  }}
                >
                  <img src={img.url} alt={img.alt} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Details */}
        <Box sx={{ flex: 1, mt: { xs: 3, md: 0 } }}>
          <Typography
            variant="h5"
            component="h1"
            fontWeight={700}
            sx={{ color: '#282d35', lineHeight: 1.3 }}
          >
            {product.title}
          </Typography>

          <Typography
            variant="body1"
            sx={{ color: '#6b7280', mt: 0.5 }}
          >
            {product.artist}
          </Typography>

          {/* Rating */}
          {product.rating != null && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mt: 1.5,
              }}
            >
              <Rating
                value={product.rating}
                precision={0.5}
                readOnly
                size="small"
              />

              <Typography
                variant="body2"
                sx={{ color: '#6b7280' }}
              >
                {product.rating} ({product.review_count} reseñas)
              </Typography>
            </Box>
          )}

          {/* Variant Selector */}
          {product.variants && product.variants.length > 1 && (
            <Box sx={{ mt: 3, mb: 1 }}>
              <Typography variant="caption" fontWeight={600} sx={{ mb: 1, display: 'block', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                Formato
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {product.variants.map((v, idx) => (
                  <Chip
                    key={v.id || idx}
                    label={v.label ? `${v.type} — ${v.label}` : v.type}
                    onClick={() => { setSelectedVariantIdx(idx); setSelectedImage(0); gallerySwiperRef.current?.slideToLoop(0); setSearchParams({ variant: buildVariantParam(product.variants, idx) }, { replace: true }) }}
                    variant={selectedVariantIdx === idx ? 'filled' : 'outlined'}
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      borderRadius: 2,
                      ...(selectedVariantIdx === idx ? {
                        bgcolor: '#282d35',
                        color: '#fff',
                        '&:hover': { bgcolor: '#1f2328' },
                      } : {
                        borderColor: '#e5e7eb',
                        '&:hover': { borderColor: '#282d35' },
                      }),
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {product.variants && product.variants.length === 1 && (
            <Chip
              label={product.variants[0].type}
              size="small"
              sx={{ mt: 2, fontWeight: 600, fontSize: '0.7rem', bgcolor: '#282d35', color: '#fff' }}
            />
          )}

          {/* Price */}
          {(() => {
            const v = product.variants?.[selectedVariantIdx]
            const priceFinal = v?.price_final || product.price_final || 0
            const priceOriginal = v?.price_original || product.price_original || 0
            const stock = v?.stock ?? product.stock ?? 0
            return (
              <>
                <Box sx={{ mt: 2.5, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
                    <Typography variant="h5" fontWeight={700} sx={{ color: '#282d35' }}>
                      ${Number(priceFinal).toLocaleString('es-MX')}
                    </Typography>
                    {priceOriginal > 0 && priceOriginal !== priceFinal && (
                      <>
                        <Typography variant="body1" sx={{ textDecoration: 'line-through', color: '#9ca3af' }}>
                          ${Number(priceOriginal).toLocaleString('es-MX')}
                        </Typography>
                        <Chip
                          label={`-${Math.round((1 - priceFinal / priceOriginal) * 100)}%`}
                          size="small"
                          sx={{ fontWeight: 700, fontSize: '0.7rem', bgcolor: '#dc2626', color: '#fff', height: 22 }}
                        />
                      </>
                    )}
                  </Box>
                </Box>

                {/* Stock badge */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 3 }}>
                  <InventoryOutlinedIcon sx={{ fontSize: 15, color: stock > 0 ? '#059669' : '#dc454d' }} />
                  <Typography
                    variant="body2"
                    sx={{
                      color: stock > 0 ? '#059669' : '#dc454d',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                    }}
                  >
                    {stock <= 0 ? 'Agotado' : stock <= 3 ? `¡Últimas ${stock} piezas!` : `${stock} en stock`}
                  </Typography>
                </Box>
              </>
            )
          })()}

          {/* Actions */}
          <Box
            ref={addToCartRef}
            sx={{
              display: 'flex',
              gap: 1.5,
              alignItems: 'center',
            }}
          >
            <BtnPrimary
              color={added ? 'success' : 'primary'}
              startIcon={
                added
                  ? <CheckIcon />
                  : <ShoppingBagOutlinedIcon />
              }
              onClick={handleAddToCart}
              disabled={(product.variants?.[selectedVariantIdx]?.stock ?? product.stock ?? 0) <= 0}
              sx={{
                px: 4,
                transition: 'all 0.3s ease',
                ...(added && { transform: 'scale(1.05)' }),
              }}
            >
              {added ? '¡Agregado!' : 'Agregar al carrito'}
            </BtnPrimary>

            <IconButton
              onClick={() => wishlistMutation.mutate()}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 50,
                '&:hover': {
                  borderColor: 'primary.main',
                },
              }}
            >
              {wishlisted ? (
                <FavoriteIcon sx={{ color: 'secondary.main' }} />
              ) : (
                <FavoriteBorderIcon sx={{ color: 'text.secondary' }} />
              )}
            </IconButton>

            <IconButton
              onClick={() => setShowShareModal(true)}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 50,
                '&:hover': { borderColor: 'primary.main' },
              }}
              aria-label="Compartir"
            >
              <ShareOutlinedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
            </IconButton>
          </Box>

          {/* Share Modal */}
          <Dialog
            open={showShareModal}
            onClose={() => setShowShareModal(false)}
            PaperProps={{ sx: { borderRadius: 3, width: '100%', maxWidth: 420, p: 0 } }}
          >
            <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 0.5, pt: 2.5, px: 3 }}>
              Compartir producto
              <IconButton onClick={() => setShowShareModal(false)} size="small" sx={{ color: '#9ca3af' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ display: 'flex', gap: 4, justifyContent: 'center', pt: '12px !important', pb: 3.5, px: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75 }}>
                <IconButton
                  onClick={() => { handleShare('whatsapp'); setShowShareModal(false) }}
                  sx={{ bgcolor: '#25D366', color: '#fff', width: 46, height: 46, '&:hover': { bgcolor: '#1da851' } }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </IconButton>
                <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500 }}>WhatsApp</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75 }}>
                <IconButton
                  onClick={() => { handleShare('twitter'); setShowShareModal(false) }}
                  sx={{ bgcolor: '#000', color: '#fff', width: 46, height: 46, '&:hover': { bgcolor: '#333' } }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </IconButton>
                <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500 }}>X</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75 }}>
                <IconButton
                  onClick={() => { handleShare('copy'); setShowShareModal(false) }}
                  sx={{ bgcolor: '#f3f4f6', color: '#374151', width: 46, height: 46, border: '1px solid #e5e7eb', '&:hover': { bgcolor: '#e5e7eb' } }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                </IconButton>
                <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500 }}>Copiar link</Typography>
              </Box>
            </DialogContent>
          </Dialog>

          {/* Trust badges */}
          <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #f0f0f0', display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <LocalShippingOutlinedIcon sx={{ fontSize: 18, color: '#6b7280' }} />
              <Typography variant="caption" sx={{ color: '#4b5563', fontWeight: 500 }}>
                Envío gratis +$999
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <SecurityOutlinedIcon sx={{ fontSize: 18, color: '#6b7280' }} />
              <Typography variant="caption" sx={{ color: '#4b5563', fontWeight: 500 }}>
                Pago seguro
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <ReplayOutlinedIcon sx={{ fontSize: 18, color: '#6b7280' }} />
              <Typography variant="caption" sx={{ color: '#4b5563', fontWeight: 500 }}>
                Devoluciones 30 días
              </Typography>
            </Box>
          </Box>

          {/* Genre */}
          {product.genre && (
            <Box
              sx={{
                mt: 3,
                pt: 3,
                borderTop: '1px solid #f0f0f0',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  fontWeight: 600,
                }}
              >
                Género
              </Typography>

              <Typography
                variant="body2"
                sx={{ mt: 0.5, color: '#282d35' }}
              >
                {product.genre}
              </Typography>
            </Box>
          )}

          {/* Description - Collapsible */}
          {product.description && (
            <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #f0f0f0' }}>
              <Box
                onClick={() => setShowDescription(!showDescription)}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', '&:hover': { opacity: 0.7 } }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}
                >
                  Descripción
                </Typography>
                {showDescription ? <ExpandLessIcon sx={{ fontSize: 18, color: '#9ca3af' }} /> : <ExpandMoreIcon sx={{ fontSize: 18, color: '#9ca3af' }} />}
              </Box>
              <Collapse in={showDescription}>
                <Typography
                  variant="body2"
                  component="div"
                  sx={{
                    mt: 1,
                    color: '#4b5563',
                    lineHeight: 1.7,
                    '& b, & strong': { fontWeight: 700 },
                    '& i, & em': { fontStyle: 'italic' },
                  }}
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description, { ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p'] }) }}
                />
              </Collapse>
            </Box>
          )}

          {/* Tracklist - Collapsible */}
          {tracklistParsed.length > 0 && (
            <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #f0f0f0' }}>
              <Box
                onClick={() => setShowTracklist(!showTracklist)}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', '&:hover': { opacity: 0.7 } }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}
                >
                  Tracklist
                </Typography>
                {showTracklist ? <ExpandLessIcon sx={{ fontSize: 18, color: '#9ca3af' }} /> : <ExpandMoreIcon sx={{ fontSize: 18, color: '#9ca3af' }} />}
              </Box>
              <Collapse in={showTracklist}>
                {tracklistParsed.map((section, sIdx) => (
                <Box key={sIdx} sx={{ mt: section.side ? 2 : 1 }}>
                  {section.side && (
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: '#282d35',
                        textTransform: 'uppercase',
                        letterSpacing: 0.3,
                        fontSize: '0.75rem',
                        mb: 0.5,
                        mt: sIdx > 0 ? 2 : 1,
                      }}
                    >
                      {section.side}
                    </Typography>
                  )}
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        sm: '1fr 1fr',
                      },
                      gap: 0,
                    }}
                  >
                    {section.tracks.map((track, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          py: 1.2,
                          px: 0,
                          borderBottom: '1px solid #f9fafb',
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#9ca3af',
                            fontWeight: 600,
                            minWidth: 24,
                            textAlign: 'right',
                          }}
                        >
                          {String(idx + 1).padStart(2, '0')}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: '#282d35' }}
                        >
                          {track}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ))}
              </Collapse>
            </Box>
          )}
        </Box>
      </Box>

      {/* Reviews Section */}
      <ReviewsSection productId={product?.id} reviewsData={reviewsData} user={user} />

      {/* Related Products */}
      <RelatedProducts slug={slug} />

      {/* Recently Viewed */}
      <RecentlyViewed currentProductId={product?.id} />

      {/* Sticky Add to Cart - Mobile */}
      <StickyAddToCart
        product={product}
        selectedVariantIdx={selectedVariantIdx}
        added={added}
        onAddToCart={handleAddToCart}
        addToCartRef={addToCartRef}
      />
    </Container>
  )
}

// =============================================
// REVIEWS SECTION COMPONENT
// =============================================
function ReviewsSection({ productId, reviewsData, user }) {
  const { notify } = useNotification()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [newRating, setNewRating] = useState(0)
  const [newTitle, setNewTitle] = useState('')
  const [newBody, setNewBody] = useState('')
  const [editingReview, setEditingReview] = useState(null)

  const createMutation = useMutation({
    mutationFn: (data) => api.createReview(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] })
      queryClient.invalidateQueries({ queryKey: ['product', productId] })
      notify('¡Reseña publicada!', 'success')
      setShowForm(false)
      setNewRating(0)
      setNewTitle('')
      setNewBody('')
    },
    onError: (err) => notify(err.message, 'error'),
  })

  const updateMutation = useMutation({
    mutationFn: (data) => api.updateReview(editingReview.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] })
      queryClient.invalidateQueries({ queryKey: ['product', productId] })
      notify('Reseña actualizada', 'success')
      setEditingReview(null)
      setNewRating(0)
      setNewTitle('')
      setNewBody('')
    },
    onError: (err) => notify(err.message, 'error'),
  })

  const reviews = reviewsData?.reviews || []
  const stats = reviewsData?.stats || { total: 0, average: 0, distribution: {} }

  const handleStartEdit = (review) => {
    setEditingReview(review)
    setNewRating(review.rating)
    setNewTitle(review.title || '')
    setNewBody(review.body)
    setShowForm(false)
  }

  const handleCancelEdit = () => {
    setEditingReview(null)
    setNewRating(0)
    setNewTitle('')
    setNewBody('')
  }

  return (
    <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid', borderColor: 'grey.200' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          Reseñas ({stats.total})
        </Typography>
        {user && !showForm && !editingReview && (
          <BtnOutlined size="small" onClick={() => setShowForm(true)}>
            Escribir reseña
          </BtnOutlined>
        )}
      </Box>

      {/* Stats bar */}
      {stats.total > 0 && (
        <Box sx={{ display: 'flex', gap: 4, mb: 4, flexWrap: 'wrap' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" fontWeight={800}>{stats.average.toFixed(1)}</Typography>
            <Rating value={stats.average} precision={0.1} readOnly size="small" />
            <Typography variant="caption" color="text.secondary" display="block">{stats.total} reseñas</Typography>
          </Box>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            {[5, 4, 3, 2, 1].map(star => {
              const count = stats.distribution[star] || 0
              const pct = stats.total > 0 ? (count / stats.total) * 100 : 0
              return (
                <Box key={star} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="caption" sx={{ width: 16, textAlign: 'right' }}>{star}</Typography>
                  <StarIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                  <LinearProgress variant="determinate" value={pct} sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: 'grey.200', '& .MuiLinearProgress-bar': { bgcolor: 'warning.main', borderRadius: 3 } }} />
                  <Typography variant="caption" color="text.secondary" sx={{ width: 24 }}>{count}</Typography>
                </Box>
              )
            })}
          </Box>
        </Box>
      )}

      {/* Write review form */}
      {showForm && (
        <Box sx={{ mb: 4, p: 3, border: '1px solid', borderColor: 'grey.200', borderRadius: 2 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>Tu reseña</Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Calificación</Typography>
            <Rating value={newRating} onChange={(_, v) => setNewRating(v)} size="large" />
          </Box>
          <TextField label="Título (opcional)" size="small" fullWidth value={newTitle} onChange={e => setNewTitle(e.target.value)} sx={{ mb: 2 }} />
          <TextField label="Tu reseña" size="small" fullWidth multiline rows={3} value={newBody} onChange={e => setNewBody(e.target.value)} sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <BtnPrimary
              size="small"
              onClick={() => createMutation.mutate({ rating: newRating, title: newTitle, body: newBody })}
              disabled={!newRating || !newBody.trim() || createMutation.isPending}
            >
              Publicar
            </BtnPrimary>
            <BtnOutlined size="small" onClick={() => setShowForm(false)}>Cancelar</BtnOutlined>
          </Box>
        </Box>
      )}

      {/* Edit review form */}
      {editingReview && (
        <Box sx={{ mb: 4, p: 3, border: '1px solid', borderColor: 'primary.main', borderRadius: 2, bgcolor: 'grey.50' }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>Editar tu reseña</Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Calificación</Typography>
            <Rating value={newRating} onChange={(_, v) => setNewRating(v)} size="large" />
          </Box>
          <TextField label="Título (opcional)" size="small" fullWidth value={newTitle} onChange={e => setNewTitle(e.target.value)} sx={{ mb: 2 }} />
          <TextField label="Tu reseña" size="small" fullWidth multiline rows={3} value={newBody} onChange={e => setNewBody(e.target.value)} sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <BtnPrimary
              size="small"
              onClick={() => updateMutation.mutate({ rating: newRating, title: newTitle, body: newBody })}
              disabled={!newRating || !newBody.trim() || updateMutation.isPending}
            >
              Guardar cambios
            </BtnPrimary>
            <BtnOutlined size="small" onClick={handleCancelEdit}>Cancelar</BtnOutlined>
          </Box>
        </Box>
      )}

      {/* Review list */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {reviews.map((review) => (
          <Box key={review.id} sx={{ p: 2.5, border: '1px solid', borderColor: 'grey.200', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Avatar
                src={review.author.avatar || undefined}
                sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.75rem' }}
              >
                {!review.author.avatar && (review.author.nombre?.charAt(0) || '?')}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {review.author.nombre}
                  </Typography>
                  {review.author.username && (
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                      @{review.author.username}
                    </Typography>
                  )}
                  {review.isVerified && <VerifiedIcon sx={{ fontSize: 14, color: 'success.main' }} />}
                </Box>
                <Typography variant="caption" color="text.disabled">
                  {new Date(review.createdAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}
                </Typography>
              </Box>
              <Rating value={review.rating} readOnly size="small" />
              {user && review.userId === user.id && (
                <IconButton size="small" onClick={() => handleStartEdit(review)} sx={{ color: 'text.secondary' }}>
                  <EditOutlinedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              )}
            </Box>
            {review.title && <Typography variant="subtitle2" sx={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, mb: 0.5 }}>{review.title}</Typography>}
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{review.body}</Typography>
          </Box>
        ))}
        {reviews.length === 0 && !showForm && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            Aún no hay reseñas. {user ? '¡Sé el primero en dejar una!' : 'Inicia sesión para dejar tu reseña.'}
          </Typography>
        )}
      </Box>
    </Box>
  )
}

// =============================================
// RELATED PRODUCTS COMPONENT
// =============================================
function RelatedProducts({ slug }) {
  const swiperRef = useRef(null)
  const viewed = getRecentlyViewedIds()

  const { data } = useQuery({
    queryKey: ['related-products', slug, viewed],
    queryFn: () => api.getRelatedProducts(slug, { limit: 10, viewed }),
    enabled: !!slug,
  })

  const products = data?.products || []

  if (products.length === 0) return null

  return (
    <Box sx={{ mt: 6, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700,
            fontSize: '1.1rem',
          }}
        >
          También te puede gustar
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={() => swiperRef.current?.slidePrev()}
            sx={{ border: '1px solid #e5e7eb', '&:hover': { bgcolor: '#f9fafb' } }}
            aria-label="Anterior"
          >
            <ChevronLeftIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => swiperRef.current?.slideNext()}
            sx={{ border: '1px solid #e5e7eb', '&:hover': { bgcolor: '#f9fafb' } }}
            aria-label="Siguiente"
          >
            <ChevronRightIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      <Swiper
        onSwiper={(swiper) => { swiperRef.current = swiper }}
        spaceBetween={16}
        slidesPerView={2}
        breakpoints={{
          480: { slidesPerView: 3 },
          768: { slidesPerView: 4 },
          1024: { slidesPerView: 5 },
          1280: { slidesPerView: 6 },
        }}
        style={{ overflow: 'visible' }}
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <ProductCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  )
}

// =============================================
// RECENTLY VIEWED COMPONENT
// =============================================
function RecentlyViewed({ currentProductId }) {
  const swiperRef = useRef(null)
  const viewedIds = getRecentlyViewed().filter(id => id !== currentProductId).slice(0, 10)

  const { data } = useQuery({
    queryKey: ['recently-viewed', viewedIds.join(',')],
    queryFn: async () => {
      if (viewedIds.length === 0) return { products: [] }
      const data = await api.getProducts({ ids: viewedIds.join(','), limit: 10 })
      return data
    },
    enabled: viewedIds.length > 0,
  })

  const products = data?.products || []

  if (products.length === 0) return null

  return (
    <Box sx={{ mt: 6, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700,
            fontSize: '1.1rem',
          }}
        >
          Vistos recientemente
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={() => swiperRef.current?.slidePrev()}
            sx={{ border: '1px solid #e5e7eb', '&:hover': { bgcolor: '#f9fafb' } }}
            aria-label="Anterior"
          >
            <ChevronLeftIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => swiperRef.current?.slideNext()}
            sx={{ border: '1px solid #e5e7eb', '&:hover': { bgcolor: '#f9fafb' } }}
            aria-label="Siguiente"
          >
            <ChevronRightIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      <Swiper
        onSwiper={(swiper) => { swiperRef.current = swiper }}
        spaceBetween={16}
        slidesPerView={2}
        breakpoints={{
          480: { slidesPerView: 3 },
          768: { slidesPerView: 4 },
          1024: { slidesPerView: 5 },
          1280: { slidesPerView: 6 },
        }}
        style={{ overflow: 'visible' }}
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <ProductCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  )
}

// =============================================
// STICKY ADD TO CART (MOBILE)
// =============================================
function StickyAddToCart({ product, selectedVariantIdx, added, onAddToCart, addToCartRef }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!addToCartRef?.current) return
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(addToCartRef.current)
    return () => observer.disconnect()
  }, [addToCartRef])

  const v = product?.variants?.[selectedVariantIdx]
  const price = v?.price_final || product?.price_final || 0
  const stock = v?.stock ?? product?.stock ?? 0

  if (!visible || stock <= 0) return null

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        display: { xs: 'flex', md: 'none' },
        alignItems: 'center',
        gap: 2,
        px: 2,
        py: 1.5,
        bgcolor: '#fff',
        borderTop: '1px solid #e5e7eb',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.08)',
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={700} noWrap sx={{ fontSize: '0.82rem' }}>
          {product.title}
        </Typography>
        <Typography variant="body2" fontWeight={700} sx={{ color: '#282d35' }}>
          ${Number(price).toLocaleString('es-MX')}
        </Typography>
      </Box>
      <BtnPrimary
        size="small"
        color={added ? 'success' : 'primary'}
        startIcon={added ? <CheckIcon /> : <ShoppingBagOutlinedIcon />}
        onClick={onAddToCart}
        sx={{ whiteSpace: 'nowrap', px: 2.5 }}
      >
        {added ? '¡Listo!' : 'Agregar'}
      </BtnPrimary>
    </Box>
  )
}
import { useQuery } from '@tanstack/react-query'
import { useRef } from 'react'
import { Container, Typography, Grid, Skeleton, Box, Paper, Button, IconButton, InputBase } from '@mui/material'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import VerifiedIcon from '@mui/icons-material/Verified'
import HeadphonesIcon from '@mui/icons-material/Headphones'
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import 'swiper/css'
import 'swiper/css/pagination'
import { api } from '../services/api'
import { useSiteConfig } from '../context/SiteConfigContext'
import ProductCard from '../components/ProductCard'
import SEO from '../components/SEO'
import './Home.css'

export default function Home() {
  const config = useSiteConfig()
  const { data: sectionsData, isLoading: loadingSections } = useQuery({
    queryKey: ['products', 'sections'],
    queryFn: () => api.getHomeSections(),
    staleTime: 0,
  })

  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ['products', 'all'],
    queryFn: () => api.getProducts({ limit: 12 }),
    staleTime: 0,
  })

  const { data: sliders = [] } = useQuery({
    queryKey: ['products', 'sliders'],
    queryFn: () => api.getHomeSliders(),
    staleTime: 0,
  })

  const rawSections = sectionsData?.sections || []
  const sections = rawSections
  const products = productsData?.products || []
  const swiperRef = useRef(null)

  return (
    <main>
      <SEO title="Inicio" description={config.seo.defaultDescription} />
      <Container maxWidth="lg" sx={{ pt: 3 }}>
        <Box sx={{ position: 'relative' }}>
          <Box sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', height: { xs: 240, sm: 290, md: 340 } }}>
            <Swiper
              modules={[Autoplay, Pagination]}
              autoplay={{ delay: 8000, disableOnInteraction: false, pauseOnMouseEnter: true }}
              pagination={{ clickable: true, el: '.slider-dots' }}
              loop
              style={{ width: '100%', height: '100%' }}
              onSwiper={(swiper) => { swiperRef.current = swiper }}
              onMouseEnter={() => swiperRef.current?.autoplay?.stop()}
              onMouseLeave={() => swiperRef.current?.autoplay?.start()}
            >
              {/* Promo slide - Hot Now vertical marquee */}
              <SwiperSlide>
                <Box
                  component={Link}
                  to={config.home.promoSlide.link}
                  sx={{
                    background: 'linear-gradient(135deg, #0f0f0f 0%, #1c1c2e 50%, #0f0f0f 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                    textDecoration: 'none',
                    display: 'flex',
                    height: '100%',
                  }}
                >
                  {/* Text left */}
                  <Box sx={{ position: 'absolute', bottom: { xs: 25, md: 40 }, left: { xs: 25, md: 40 }, zIndex: 2 }}>
                    <Typography sx={{ color: '#fff', fontWeight: 800, textShadow: '0 2px 10px rgba(0,0,0,0.8)', lineHeight: 1.1, fontSize: { xs: '2.2rem', sm: '2.6rem', md: '3.2rem' }, letterSpacing: '-0.04em' }}>
                      {config.home.promoSlide.title}
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5, textShadow: '0 1px 5px rgba(0,0,0,0.8)', fontSize: { xs: '0.85rem', md: '1.05rem' } }}>
                      {config.home.promoSlide.subtitle}
                    </Typography>
                  </Box>
                  {/* Vertical marquee columns on the right */}
                  <Box sx={{ ml: 'auto', display: 'flex', gap: 1, pr: 2, height: '100%', overflow: 'hidden' }}>
                    {[
                      { items: products.length > 0 ? [products[0], products[1 % products.length], products[2 % products.length], products[3 % products.length], products[4 % products.length]] : [], dir: 'up', speed: 28 },
                      { items: products.length > 0 ? [products[3 % products.length], products[5 % products.length], products[7 % products.length], products[9 % products.length], products[11 % products.length]] : [], dir: 'down', speed: 55 },
                      { items: products.length > 0 ? [products[2 % products.length], products[4 % products.length], products[6 % products.length], products[8 % products.length], products[10 % products.length]] : [], dir: 'up', speed: 28 },
                      { items: products.length > 0 ? [products[1 % products.length], products[6 % products.length], products[11 % products.length], products[13 % products.length], products[0]] : [], dir: 'down', speed: 55 },
                      { items: products.length > 0 ? [products[5 % products.length], products[8 % products.length], products[12 % products.length], products[14 % products.length], products[3 % products.length]] : [], dir: 'up', speed: 35 },
                    ].map((col, colIdx) => (
                      <Box key={`col-${colIdx}`} sx={{ overflow: 'hidden', height: '100%', position: 'relative' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, animation: `marquee-${col.dir} ${col.speed}s linear infinite`, willChange: 'transform' }}>
                          {[...col.items, ...col.items].map((p, i) => p && (
                            <Box
                              key={`c${colIdx}-${i}`}
                              component="img"
                              src={
                                p.cover_image ||
                                p.coverUrl ||
                                p.imageUrl ||
                                'https://placehold.co/300x300/ccc/333?text=No+Image'
                              }
                              sx={{
                                width: { xs: 90, sm: 110, md: 140 },
                                height: { xs: 90, sm: 110, md: 140 },
                                borderRadius: 2,
                                flexShrink: 0,
                                objectFit: 'cover'
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                  {/* Gradient overlays */}
                  <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(15,15,15,0.95) 0%, rgba(15,15,15,0.5) 45%, transparent 100%)', pointerEvents: 'none' }} />
                  <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,15,15,0.6) 0%, transparent 30%)', pointerEvents: 'none' }} />
                </Box>
              </SwiperSlide>

              {sliders.map((slide, i) => (
                <SwiperSlide key={slide.id || i}>
                  <img src={slide.image_url} alt={slide.title || `Slider ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </SwiperSlide>
              ))}
            </Swiper>
          </Box>
          {/* Custom nav buttons */}
          <IconButton
            onClick={() => swiperRef.current?.slidePrev()}
            sx={{
              position: 'absolute', top: '50%', left: { xs: 6, md: 12 }, transform: 'translateY(-50%)', zIndex: 10,
              bgcolor: 'rgba(255,255,255,0.9)', width: { xs: 28, md: 36 }, height: { xs: 28, md: 36 },
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              '&:hover': { bgcolor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.25)' },
            }}
          >
            <ChevronLeftIcon sx={{ fontSize: { xs: 16, md: 22 }, color: '#282d35' }} />
          </IconButton>
          <IconButton
            onClick={() => swiperRef.current?.slideNext()}
            sx={{
              position: 'absolute', top: '50%', right: { xs: 6, md: 12 }, transform: 'translateY(-50%)', zIndex: 10,
              bgcolor: 'rgba(255,255,255,0.9)', width: { xs: 28, md: 36 }, height: { xs: 28, md: 36 },
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              '&:hover': { bgcolor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.25)' },
            }}
          >
            <ChevronRightIcon sx={{ fontSize: { xs: 16, md: 22 }, color: '#282d35' }} />
          </IconButton>
          <Box className="slider-dots" sx={{ display: 'flex', justifyContent: 'center', mt: 1.5 }} />
        </Box>
      </Container>

      {/* Dynamic sections from admin */}
      {loadingSections ? (
        <Container maxWidth="lg" sx={{ py: 5 }}>
          {Array.from({ length: 2 }).map((_, i) => (
            <Box key={i} sx={{ mb: 5 }}>
              <Skeleton width={180} height={32} sx={{ mb: 3 }} />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {Array.from({ length: 4 }).map((_, j) => (
                  <Box key={j} sx={{ width: { xs: 'calc(50% - 12px)', sm: 'calc(33.33% - 16px)', md: 'calc(25% - 18px)' } }}>
                    <Skeleton height={250} variant="rounded" sx={{ aspectRatio: '1', width: '100%', borderRadius: 2 }} />
                    <Skeleton sx={{ mt: 1.5, width: '50%', height: 12 }} />
                    <Skeleton sx={{ mt: 0.8, width: '80%', height: 16 }} />
                    <Skeleton sx={{ mt: 0.8, width: '35%', height: 16 }} />
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Container>
      ) : sections.map(section => section.products.length > 0 && (
        <Container key={section.id} maxWidth="lg" sx={{ py: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3.5 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>{section.title}</Typography>
              {section.subtitle && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>{section.subtitle}</Typography>}
            </Box>
            {section.link_url && (
              <Button
                component={Link}
                to={section.link_url}
                variant="outlined"
                size="small"
                sx={{ fontWeight: 600, fontSize: '0.72rem', borderRadius: 5, px: 2, textTransform: 'none', borderColor: '#e0e0e0', color: '#555', '&:hover': { borderColor: '#282d35', color: '#282d35', bgcolor: 'transparent' } }}
              >
                {section.link_text || 'Ver todo'}
              </Button>
            )}
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 3 }}>
            {section.products.map(product => (
              <Box key={product.id} sx={{ width: { xs: 'calc(50% - 12px)', sm: 'calc(33.33% - 16px)', md: 'calc(25% - 18px)' } }}>
                <ProductCard product={product} linkState={{ from: '/', fromLabel: section.title || 'Inicio' }} />
              </Box>
            ))}
          </Box>
        </Container>
      ))}

      {/* Fallback: show all products if no sections exist */}
      {!loadingSections && sections.length === 0 && (
        <Container maxWidth="lg" sx={{ py: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>Catálogo</Typography>
            <Button
              component={Link}
              to="/search"
              variant="outlined"
              size="small"
              sx={{ fontWeight: 600, fontSize: '0.72rem', borderRadius: 5, px: 2, textTransform: 'none', borderColor: '#e0e0e0', color: '#555', '&:hover': { borderColor: '#282d35', color: '#282d35', bgcolor: 'transparent' } }}
            >
              Ver todo
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 3 }}>
            {loadingProducts
              ? Array.from({ length: 8 }).map((_, i) => (
                <Box key={i} sx={{ width: { xs: 'calc(50% - 12px)', sm: 'calc(33.33% - 16px)', md: 'calc(25% - 18px)' } }}>
                  <Skeleton height={250} variant="rounded" sx={{ aspectRatio: '1', width: '100%', borderRadius: 2 }} />
                  <Skeleton sx={{ mt: 1.5, width: '50%', height: 12 }} />
                  <Skeleton sx={{ mt: 0.8, width: '80%', height: 16 }} />
                  <Skeleton sx={{ mt: 0.8, width: '35%', height: 16 }} />
                </Box>
              ))
              : products.map(product => (
                <Box key={product.id} sx={{ width: { xs: 'calc(50% - 12px)', sm: 'calc(33.33% - 16px)', md: 'calc(25% - 18px)' } }}>
                  <ProductCard product={product} linkState={{ from: '/', fromLabel: 'Catálogo' }} />
                </Box>
              ))
            }
          </Box>
        </Container>
      )}

      {/* CTA Banner */}
      <Box sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #282d35 100%)', py: { xs: 6, md: 8 }, textAlign: 'center' }}>
        <Container maxWidth="sm">
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, mb: 1.5, letterSpacing: '-0.02em' }}>
            {config.home.ctaBanner.title}
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.6)', mb: 3.5, fontSize: '0.95rem' }}>
            {config.home.ctaBanner.description}
          </Typography>
          <Button
            component={Link}
            to={config.home.ctaBanner.buttonLink}
            variant="contained"
            color="secondary"
            size="large"
            sx={{ px: 5, py: 1.5, fontSize: '0.95rem', borderRadius: 2 }}
          >
            {config.home.ctaBanner.buttonText}
          </Button>
        </Container>
      </Box>

      {/* Category Cards */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
          {config.home.categoryCards.map((card, idx) => (
            <Grid key={idx} size={{ xs: 12, md: 6 }}>
              <Paper
                component={Link}
                to={card.link}
                sx={{
                  p: { xs: 4, md: 5 },
                  bgcolor: card.bgcolor,
                  color: '#fff',
                  textDecoration: 'none',
                  display: 'block',
                  borderRadius: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.02)' },
                  '&:hover .card-arrow': { transform: 'translateX(4px)' },
                }}
              >
                <Box sx={{ position: 'absolute', top: -20, right: -20, width: 180, height: 180, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)' }} />
                <Box sx={{ position: 'absolute', bottom: -40, right: 40, width: 120, height: 120, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.03)' }} />
                <Typography variant="overline" sx={{ color: card.accentColor, fontWeight: 700, letterSpacing: 1.5 }}>{card.overline}</Typography>
                <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>{card.title}</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1, maxWidth: 280 }}>
                  {card.description}
                </Typography>
                <Box className="card-arrow" sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 0.5, color: card.accentColor, transition: 'transform 0.2s' }}>
                  <Typography variant="body2" fontWeight={600}>Explorar</Typography>
                  <ArrowForwardIcon sx={{ fontSize: 16 }} />
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Newsletter */}
      <Box sx={{ bgcolor: '#fafafa', py: 6 }}>
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: '#282d35', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <CardGiftcardIcon sx={{ fontSize: 22 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
            {config.home.newsletter.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {config.home.newsletter.description}
          </Typography>
          <Box
            component="form"
            onSubmit={(e) => e.preventDefault()}
            sx={{
              display: 'flex',
              maxWidth: 400,
              mx: 'auto',
              height: 44,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              borderRadius: '50px',
              overflow: 'hidden',
              border: '1px solid #e8e8e8',
            }}
          >
            <InputBase
              placeholder="tu@email.com"
              sx={{
                flex: 1,
                px: 2.5,
                fontSize: '0.88rem',
                bgcolor: '#fff',
              }}
            />
            <Button
              variant="contained"
              color="primary"
              size="small"
              sx={{
                borderRadius: 0,
                px: 3,
                whiteSpace: 'nowrap',
                fontSize: '0.8rem',
                boxShadow: 'none',
                fontWeight: 600,
              }}
            >
              {config.home.newsletter.buttonText}
            </Button>
          </Box>
        </Container>
      </Box>
    </main>
  )
}

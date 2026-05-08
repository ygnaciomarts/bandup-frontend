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
import ProductCard from '../components/ProductCard'
import './Home.css'

const SLIDER_IMAGES = [
  '/img/slider/Slider-INTD.png',
  '/img/slider/Slider-KenisOs-KDEK.png',
  '/img/slider/Slider-WGIA.png',
  '/img/slider/Slider-Sexistential.png'
]

export default function Home() {
  const { data: featuredData, isLoading: loadingFeatured } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => api.getFeatured(),
  })

  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ['products', 'all'],
    queryFn: () => api.getProducts({ limit: 12 }),
  })

  const featured = featuredData?.products || []
  const products = productsData?.products || []
  const swiperRef = useRef(null)

  console.log('Featured products:', featured)
  console.log('All products:', products)

  return (
    <main>
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
                  to="/search?sort=top"
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
                      Hot Now
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5, textShadow: '0 1px 5px rgba(0,0,0,0.8)', fontSize: { xs: '0.85rem', md: '1.05rem' } }}>
                      Lo más vendido esta semana
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

              {SLIDER_IMAGES.map((img, i) => (
                <SwiperSlide key={i}>
                  <img src={img} alt={`Slider ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
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

      {(loadingFeatured || featured.length > 0) && (
        <Container maxWidth="lg" sx={{ py: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Novedades
            </Typography>
            <Button component={Link} to="/search?filter=new" variant="text" size="small" sx={{ fontWeight: 600 }}>
              Ver todo →
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 3 }}>
            {loadingFeatured
              ? Array.from({ length: 4 }).map((_, i) => (
                <Box key={i} sx={{ width: { xs: 'calc(50% - 12px)', sm: 'calc(33.33% - 16px)', md: 'calc(25% - 18px)' } }}>
                  <Skeleton height={250} variant="rounded" sx={{ aspectRatio: '1', width: '100%', borderRadius: 2 }} />
                  <Skeleton sx={{ mt: 1.5, width: '50%', height: 12 }} />
                  <Skeleton sx={{ mt: 0.8, width: '80%', height: 16 }} />
                  <Skeleton sx={{ mt: 0.8, width: '35%', height: 16 }} />
                </Box>
              ))
              : featured.map(product => (
                <Box key={product.id} sx={{ width: { xs: 'calc(50% - 12px)', sm: 'calc(33.33% - 16px)', md: 'calc(25% - 18px)' } }}>
                  <ProductCard product={product} />
                </Box>
              ))
            }
          </Box>
        </Container>
      )}

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Top Sellers
          </Typography>
          <Button component={Link} to="/search?sort=top" variant="text" size="small" sx={{ fontWeight: 600 }}>
            Ver todo →
          </Button>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 3 }}>
          {loadingProducts
            ? Array.from({ length: 8 }).map((_, i) => (
              <Box key={i} sx={{ width: { xs: 'calc(50% - 12px)', sm: 'calc(33.33% - 16px)', md: 'calc(25% - 18px)' } }}>
                <Skeleton height={250}  variant="rounded" sx={{ aspectRatio: '1', width: '100%', borderRadius: 2 }} />
                <Skeleton sx={{ mt: 1.5, width: '50%', height: 12 }} />
                <Skeleton sx={{ mt: 0.8, width: '80%', height: 16 }} />
                <Skeleton sx={{ mt: 0.8, width: '35%', height: 16 }} />
              </Box>
            ))
            : products.map(product => (
              <Box key={product.id} sx={{ width: { xs: 'calc(50% - 12px)', sm: 'calc(33.33% - 16px)', md: 'calc(25% - 18px)' } }}>
                <ProductCard product={product} />
              </Box>
            ))
          }
        </Box>
      </Container>

      {/* Perks Bar */}
      <Box sx={{ bgcolor: '#fff', py: 5, borderTop: '1px solid #e5e5e5', borderBottom: '1px solid #e5e5e5' }}>
        <Container maxWidth="lg">
          <Grid container spacing={3} justifyContent="center">
            {[
              { icon: <LocalShippingIcon sx={{ fontSize: 40 }} />, title: 'Envío Gratis', desc: 'En órdenes mayores a $799' },
              { icon: <VerifiedIcon sx={{ fontSize: 40 }} />, title: '100% Original', desc: 'Producto auténtico garantizado' },
              { icon: <HeadphonesIcon sx={{ fontSize: 40 }} />, title: 'Soporte 24/7', desc: 'Estamos para ayudarte' },
              { icon: <CardGiftcardIcon sx={{ fontSize: 40 }} />, title: 'Gift Cards', desc: 'El regalo perfecto' },
            ].map((perk, i) => (
              <Grid item xs={6} sm={6} md={3} key={i}>
                <Box sx={{ textAlign: 'center', px: { xs: 1, md: 2 } }}>
                  <Box sx={{ color: '#282d35', mb: 1, display: 'flex', justifyContent: 'center' }}>{perk.icon}</Box>
                  <Typography variant="subtitle1" fontWeight={700}>{perk.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{perk.desc}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Banner */}
      <Box sx={{ bgcolor: '#282d35', py: 8, textAlign: 'center' }}>
        <Container maxWidth="sm">
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 2 }}>
            ¿Buscas algo especial?
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
            Explora nuestro catálogo completo con LPs, CDs y ediciones limitadas de cientos de artistas.
          </Typography>
          <Button
            component={Link}
            to="/search"
            variant="contained"
            color="secondary"
            size="large"
            sx={{ px: 5, py: 1.5, fontSize: '1rem' }}
          >
            Ver catálogo completo
          </Button>
        </Container>
      </Box>

      {/* Category Cards */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={6}>
            <Paper
              component={Link}
              to="/search?tipo=LP"
              sx={{
                p: { xs: 3, md: 5 },
                bgcolor: '#1a1a2e',
                color: '#fff',
                textDecoration: 'none',
                display: 'block',
                borderRadius: 3,
                textAlign: 'center',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.02)' }
              }}
            >
              <Typography variant="overline" sx={{ color: '#dc454d' }}>Colección</Typography>
              <Typography variant="h4" fontWeight={700}>LPs</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}>
                La experiencia analógica que mereces. Ediciones especiales y clásicos.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper
              component={Link}
              to="/search?tipo=CD"
              sx={{
                p: { xs: 3, md: 5 },
                bgcolor: '#dc454d',
                color: '#fff',
                textDecoration: 'none',
                display: 'block',
                borderRadius: 3,
                textAlign: 'center',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.02)' }
              }}
            >
              <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.8)' }}>Colección</Typography>
              <Typography variant="h4" fontWeight={700}>CDs</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1 }}>
                Calidad digital, empaque físico. Tus álbumes favoritos a precio accesible.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Newsletter */}
      <Box sx={{ bgcolor: '#fafafa', py: 6, borderTop: '1px solid #f0f0f0' }}>
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            No te pierdas nada
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Suscríbete y recibe 10% OFF en tu primera compra + acceso anticipado a lanzamientos.
          </Typography>
          <Box
            component="form"
            onSubmit={(e) => e.preventDefault()}
            sx={{
              display: 'flex',
              maxWidth: 380,
              mx: 'auto',
              height: 40,
            }}
          >
            <InputBase
              placeholder="tu@email.com"
              sx={{
                flex: 1,
                px: 2,
                fontSize: '0.85rem',
                border: '1px solid #e0e0e0',
                borderRight: 'none',
                borderRadius: '50px 0 0 50px',
                bgcolor: '#fff',
              }}
            />
            <Button
              variant="contained"
              color="primary"
              size="small"
              sx={{
                borderRadius: '0 50px 50px 0',
                px: 2.5,
                whiteSpace: 'nowrap',
                fontSize: '0.78rem',
                boxShadow: 'none',
              }}
            >
              Suscribirse
            </Button>
          </Box>
        </Container>
      </Box>
    </main>
  )
}

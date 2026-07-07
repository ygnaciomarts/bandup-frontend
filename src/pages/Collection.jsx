import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Container, Typography, Box, Grid, Skeleton, Breadcrumbs } from '@mui/material'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import { api } from '../services/api'
import ProductCard from '../components/ProductCard'
import { EmptyState } from '../components/ui'

export default function Collection() {
  const { slug } = useParams()

  const { data: collection, isLoading, error } = useQuery({
    queryKey: ['collection', slug],
    queryFn: () => api.getCollection(slug),
  })

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton width={150} height={14} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={200} sx={{ borderRadius: 2, mb: 3 }} />
        <Skeleton width="30%" height={28} sx={{ mb: 1 }} />
        <Skeleton width="50%" height={14} sx={{ mb: 3 }} />
        <Grid container spacing={2.5}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Grid item xs={6} sm={4} md={3} key={i}>
              <Skeleton variant="rounded" sx={{ aspectRatio: '1', width: '100%', borderRadius: 2 }} />
              <Skeleton sx={{ mt: 1.5, width: '45%', height: 10 }} />
              <Skeleton sx={{ mt: 0.8, width: '75%', height: 14 }} />
              <Skeleton sx={{ mt: 0.8, width: '30%', height: 14 }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    )
  }

  if (error || !collection) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <EmptyState title="Colección no encontrada" subtitle="Esta colección no existe o fue desactivada." />
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 16 }} />} sx={{ mb: 2 }}>
        <Typography component={Link} to="/" variant="caption" color="text.secondary" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Inicio</Typography>
        <Typography variant="caption" color="text.primary">{collection.name}</Typography>
      </Breadcrumbs>

      {/* Collection header */}
      {collection.coverImage && (
        <Box
          sx={{
            mb: 3, borderRadius: 2, overflow: 'hidden', position: 'relative', height: 200,
            backgroundImage: `url(${collection.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            '&::before': { content: '""', position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.4)' },
          }}
        >
          <Typography variant="h4" fontWeight={800} sx={{ color: '#fff', position: 'relative', zIndex: 1 }}>
            {collection.name}
          </Typography>
        </Box>
      )}

      {!collection.coverImage && (
        <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>{collection.name}</Typography>
      )}

      {collection.description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 600 }}>
          {collection.description}
        </Typography>
      )}

      {/* Products grid */}
      {collection.products?.length > 0 ? (
        <Grid container spacing={2.5}>
          {collection.products.map(product => (
            <Grid item xs={6} sm={4} md={3} key={product.id}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>
          No hay productos en esta colección aún.
        </Typography>
      )}
    </Container>
  )
}

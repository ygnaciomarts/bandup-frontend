import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Container, Typography, Grid, Box, Skeleton } from '@mui/material'
import { api } from '../services/api'

export default function Collections() {
  const { data: collections = [], isLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: () => api.getCollections(),
  })

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>Colecciones</Typography>

      {isLoading ? (
        <Grid container spacing={2.5}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rounded" height={180} sx={{ borderRadius: 2 }} />
              <Skeleton sx={{ mt: 1, width: '50%', height: 18 }} />
              <Skeleton sx={{ mt: 0.5, width: '70%', height: 12 }} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={2.5}>
          {collections.map(col => (
            <Grid item xs={12} sm={6} md={4} key={col.id}>
              <Box
                component={Link}
                to={`/collection/${col.slug}`}
                sx={{
                  display: 'block', textDecoration: 'none', borderRadius: 2, overflow: 'hidden',
                  position: 'relative', height: 180, backgroundSize: 'cover', backgroundPosition: 'center',
                  backgroundImage: col.coverImage ? `url(${col.coverImage})` : undefined,
                  bgcolor: col.coverImage ? undefined : 'grey.200',
                  '&::before': { content: '""', position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.35)' },
                  '&:hover::before': { bgcolor: 'rgba(0,0,0,0.5)' },
                  transition: 'all 0.2s',
                }}
              >
                <Box sx={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', p: 2.5 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#fff' }}>{col.name}</Typography>
                  {col.description && (
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>{col.description}</Typography>
                  )}
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  )
}

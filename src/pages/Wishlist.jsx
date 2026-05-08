import { Link } from 'react-router-dom'
import { Container, Typography, Button, Box } from '@mui/material'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'

export default function Wishlist() {
  return (
    <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
      <Box sx={{
        width: 64, height: 64, borderRadius: '50%', bgcolor: '#f5f5f5',
        display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5
      }}>
        <FavoriteBorderIcon sx={{ fontSize: 28, color: '#9ca3af' }} />
      </Box>
      <Typography variant="h6" fontWeight={700} sx={{ color: '#282d35', mb: 0.5 }}>
        Tu wishlist está vacía
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Explora nuestro catálogo y guarda tus favoritos.
      </Typography>
      <Button component={Link} to="/search" variant="contained" color="primary">
        Explorar catálogo
      </Button>
    </Container>
  )
}

import { Link } from 'react-router-dom'
import { Container, Typography, Button } from '@mui/material'

export default function NotFound() {
  return (
    <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h1" color="secondary" sx={{ fontSize: '6rem', fontWeight: 900 }}>
        404
      </Typography>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        Página no encontrada
      </Typography>
      <Button component={Link} to="/" variant="contained" color="secondary" sx={{ mt: 2 }}>
        Volver al inicio
      </Button>
    </Container>
  )
}

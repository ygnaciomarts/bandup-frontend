import { useParams, Link } from 'react-router-dom'
import { Container, Paper, Typography, Button, Box } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

export default function OrderSuccess() {
  const { id } = useParams()

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 5, textAlign: 'center' }}>
        <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom fontWeight={700}>
          ¡Orden exitosa!
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 1 }}>
          Tu orden <strong>#{id}</strong> ha sido creada correctamente.
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Recibirás un correo con los detalles de tu compra.
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button component={Link} to="/" variant="contained" color="secondary">
            Seguir comprando
          </Button>
          <Button component={Link} to="/my-account" variant="outlined" color="secondary">
            Mis órdenes
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}

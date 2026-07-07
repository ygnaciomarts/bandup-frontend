import { Container, Typography, Paper } from '@mui/material'

export default function About() {
  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>
        Quiénes Somos
      </Typography>
      <Paper sx={{ p: 4 }}>
        <Typography paragraph lineHeight={1.8}>
          BandUp es una tienda en línea dedicada a los amantes de la música. Ofrecemos LPs, CDs y artículos
          de colección de tus artistas favoritos. Nuestra misión es acercar la música física a una nueva
          generación de oyentes que valoran la experiencia tangible de escuchar un disco.
        </Typography>
        <Typography paragraph lineHeight={1.8}>
          Fundada en 2024, nos especializamos en ediciones especiales, preventa de lanzamientos exclusivos
          y artículos difíciles de encontrar. Trabajamos directamente con distribuidoras para garantizar
          la autenticidad de cada producto.
        </Typography>
      </Paper>
    </Container>
  )
}

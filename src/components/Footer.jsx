import { Link } from 'react-router-dom'
import { Container, Grid, Typography, Box, IconButton, Divider } from '@mui/material'
import InstagramIcon from '@mui/icons-material/Instagram'
import FacebookIcon from '@mui/icons-material/Facebook'
import XIcon from '@mui/icons-material/X'

export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: '#282d35', color: '#fff', pt: 5, pb: 3 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: -0.5 }}>
              BandUp
            </Typography>
            <Typography variant="body2" sx={{ mt: 1.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, fontSize: '0.82rem' }}>
              Tu tienda de música favorita. LPs, CDs y ediciones especiales.
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 0.5 }}>
              <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.45)', '&:hover': { color: '#fff' } }}>
                <InstagramIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.45)', '&:hover': { color: '#fff' } }}>
                <FacebookIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.45)', '&:hover': { color: '#fff' } }}>
                <XIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </Grid>

          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.68rem', mb: 2, color: 'rgba(255,255,255,0.35)' }}>
              Tienda
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              <Link to="/search?filter=new" style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem', textDecoration: 'none' }}>Novedades</Link>
              <Link to="/search?filter=sale" style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem', textDecoration: 'none' }}>Ofertas</Link>
              <Link to="/search?tipo=CD" style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem', textDecoration: 'none' }}>CDs</Link>
              <Link to="/search?tipo=LP" style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem', textDecoration: 'none' }}>LPs</Link>
            </Box>
          </Grid>

          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.68rem', mb: 2, color: 'rgba(255,255,255,0.35)' }}>
              Info
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              <Link to="/quienes-somos" style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem', textDecoration: 'none' }}>Quiénes somos</Link>
              <Link to="/contacto" style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem', textDecoration: 'none' }}>Contacto</Link>
              <Link to="/terminos" style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem', textDecoration: 'none' }}>Términos</Link>
              <Link to="/envios" style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem', textDecoration: 'none' }}>Envíos</Link>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.68rem', mb: 2, color: 'rgba(255,255,255,0.35)' }}>
              Soporte
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem' }}>
              soporte@bandup.com
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.07)' }} />

        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.35)', textAlign: 'center', fontSize: '0.75rem' }}>
          © 2026 BandUp. Todos los derechos reservados.
        </Typography>
      </Container>
    </Box>
  )
}

import { Link } from 'react-router-dom'
import { Container, Grid, Typography, Box, IconButton, Divider } from '@mui/material'
import InstagramIcon from '@mui/icons-material/Instagram'
import FacebookIcon from '@mui/icons-material/Facebook'
import XIcon from '@mui/icons-material/X'
import { useSiteConfig } from '../context/SiteConfigContext'

const footerLinkSx = { color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem', textDecoration: 'none', '&:hover': { color: '#fff' } }
const sectionTitleSx = { textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.68rem', mb: 2, color: 'rgba(255,255,255,0.35)' }
const socialBtnSx = { color: 'rgba(255,255,255,0.45)', '&:hover': { color: '#fff' } }

export default function Footer() {
  const config = useSiteConfig()

  return (
    <Box component="footer" sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', pt: 5, pb: 3 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ justifyContent: 'space-between' }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: -0.5 }}>
              {config.siteName}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, fontSize: '0.82rem' }}>
              {config.tagline}
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 0.5 }}>
              {config.social.instagram && (
                <IconButton size="small" sx={socialBtnSx} component="a" href={config.social.instagram} target="_blank" rel="noopener noreferrer"><InstagramIcon sx={{ fontSize: 18 }} /></IconButton>
              )}
              {config.social.facebook && (
                <IconButton size="small" sx={socialBtnSx} component="a" href={config.social.facebook} target="_blank" rel="noopener noreferrer"><FacebookIcon sx={{ fontSize: 18 }} /></IconButton>
              )}
              {config.social.x && (
                <IconButton size="small" sx={socialBtnSx} component="a" href={config.social.x} target="_blank" rel="noopener noreferrer"><XIcon sx={{ fontSize: 16 }} /></IconButton>
              )}
              {!config.social.instagram && !config.social.facebook && !config.social.x && (
                <>
                  <IconButton size="small" sx={socialBtnSx}><InstagramIcon sx={{ fontSize: 18 }} /></IconButton>
                  <IconButton size="small" sx={socialBtnSx}><FacebookIcon sx={{ fontSize: 18 }} /></IconButton>
                  <IconButton size="small" sx={socialBtnSx}><XIcon sx={{ fontSize: 16 }} /></IconButton>
                </>
              )}
            </Box>
          </Grid>

          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={sectionTitleSx}>Tienda</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              {config.footer.tienda.map((link) => (
                <Box key={link.to} component={Link} to={link.to} sx={footerLinkSx}>{link.label}</Box>
              ))}
            </Box>
          </Grid>

          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={sectionTitleSx}>Info</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              {config.footer.info.map((link) => (
                <Box key={link.to} component={Link} to={link.to} sx={footerLinkSx}>{link.label}</Box>
              ))}
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={sectionTitleSx}>Soporte</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem' }}>
              {config.supportEmail}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.07)' }} />

        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.35)', textAlign: 'center', fontSize: '0.75rem' }}>
          {config.copyright}
        </Typography>
      </Container>
    </Box>
  )
}

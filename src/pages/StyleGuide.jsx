import { Box, Typography, Button, Chip, Stack, Paper, Avatar, LinearProgress, IconButton, Badge, Divider } from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import FavoriteIcon from '@mui/icons-material/Favorite'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import NewReleasesIcon from '@mui/icons-material/NewReleases'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import StarIcon from '@mui/icons-material/Star'

const PALETTE = [
  { name: 'Brand Blue-Dark', hex: '#282d35', light: '#3a4150', dark: '#1a1e24', text: '#fff' },
  { name: 'Red', hex: '#dc454d', light: '#e8696f', dark: '#b8363d', text: '#fff' },
  { name: 'Gray', hex: '#6b7280', light: '#9ca3af', dark: '#374151', text: '#fff' },
  { name: 'Light', hex: '#e5e5e5', light: '#f5f5f5', dark: '#cccccc', text: '#282d35' },
  { name: 'White', hex: '#ffffff', light: '#ffffff', dark: '#f5f5f5', text: '#282d35' },
]

export default function StyleGuide() {
  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', py: 6, px: 3 }}>
      <Typography variant="h3" gutterBottom>BandUp — Style Guide</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 5 }}>
        Paleta de colores, botones y componentes del sistema de diseño.
      </Typography>

      {/* Color Palette */}
      <Typography variant="h5" sx={{ mb: 3 }}>Paleta de colores</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2, mb: 6 }}>
        {PALETTE.map((color) => (
          <Paper key={color.name} sx={{ overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)' }}>
            <Box sx={{ height: 100, background: color.hex, display: 'flex', alignItems: 'end', p: 2 }}>
              <Typography sx={{ color: color.text, fontWeight: 700, fontSize: '0.85rem' }}>{color.name}</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 0 }}>
              <Box sx={{ flex: 1, height: 36, background: color.dark, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ color: color.text, fontSize: '0.65rem', opacity: 0.9 }}>{color.dark}</Typography>
              </Box>
              <Box sx={{ flex: 1, height: 36, background: color.hex, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ color: color.text, fontSize: '0.65rem', opacity: 0.9 }}>{color.hex}</Typography>
              </Box>
              <Box sx={{ flex: 1, height: 36, background: color.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ color: color.text, fontSize: '0.65rem', opacity: 0.9 }}>{color.light}</Typography>
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Buttons */}
      <Typography variant="h5" sx={{ mb: 3 }}>Botones</Typography>
      <Paper sx={{ p: 4, mb: 6 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, color: 'text.secondary' }}>Contained</Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Button variant="contained" color="primary">Primary</Button>
          <Button variant="contained" color="secondary">Secondary</Button>
        </Stack>

        <Typography variant="subtitle1" sx={{ mb: 2, color: 'text.secondary' }}>Outlined</Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Button variant="outlined" color="primary">Primary</Button>
          <Button variant="outlined" color="secondary">Secondary</Button>
        </Stack>

        <Typography variant="subtitle1" sx={{ mb: 2, color: 'text.secondary' }}>Sizes</Typography>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
          <Button variant="contained" size="small">Small</Button>
          <Button variant="contained">Medium</Button>
          <Button variant="contained" size="large">Large</Button>
        </Stack>

        <Typography variant="subtitle1" sx={{ mb: 2, color: 'text.secondary' }}>Text</Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="text">Text Button</Button>
          <Button variant="text" color="secondary">Text Secondary</Button>
        </Stack>
      </Paper>

      {/* Chips */}
      <Typography variant="h5" sx={{ mb: 3 }}>Chips & Tags</Typography>
      <Paper sx={{ p: 4, mb: 6 }}>
        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1.5 }}>
          <Chip label="Nuevo" color="secondary" />
          <Chip label="Hot" color="secondary" variant="outlined" />
          <Chip label="Rock" color="default" />
          <Chip label="Metal" color="default" />
          <Chip label="LP" variant="outlined" />
          <Chip label="CD" variant="outlined" />
          <Chip label="-20%" color="secondary" size="small" />
        </Stack>
      </Paper>

      {/* Typography */}
      <Typography variant="h5" sx={{ mb: 3 }}>Tipografía</Typography>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h1" sx={{ mb: 1 }}>Heading 1</Typography>
        <Typography variant="h2" sx={{ mb: 1 }}>Heading 2</Typography>
        <Typography variant="h3" sx={{ mb: 1 }}>Heading 3</Typography>
        <Typography variant="h4" sx={{ mb: 1 }}>Heading 4</Typography>
        <Typography variant="h5" sx={{ mb: 1 }}>Heading 5</Typography>
        <Typography variant="h6" sx={{ mb: 2 }}>Heading 6</Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>Body 1 — Inter 400. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>Body 2 — Inter 400. Texto secundario más pequeño para descripciones.</Typography>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Subtitle 1 — Inter 500</Typography>
        <Typography variant="body1" color="text.secondary">Text secondary color — para metadata y textos de apoyo.</Typography>
      </Paper>

      {/* Real UI Examples */}
      <Typography variant="h5" sx={{ mt: 6, mb: 3 }}>En uso — Componentes reales</Typography>
      
      {/* Product Card Mock */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 3, mb: 6 }}>
        {/* Card 1 - New release */}
        <Paper sx={{ overflow: 'hidden', position: 'relative' }}>
          <Box sx={{ height: 200, background: '#282d35', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ color: '#6b7280', fontSize: '3rem' }}>🎸</Typography>
          </Box>
          <Chip label="Nuevo" color="secondary" size="small" sx={{ position: 'absolute', top: 12, left: 12 }} />
          <Box sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Dark Side of the Moon</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Pink Floyd — LP 180g</Typography>
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 2 }}>
              {[1,2,3,4,5].map(i => <StarIcon key={i} sx={{ fontSize: 14, color: i <= 4 ? '#dc454d' : '#e5e5e5' }} />)}
              <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>(23)</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" sx={{ fontWeight: 700 }}>$34.990</Typography>
              <Button variant="contained" size="small" color="secondary">Agregar</Button>
            </Stack>
          </Box>
        </Paper>

        {/* Card 2 - On sale */}
        <Paper sx={{ overflow: 'hidden', position: 'relative' }}>
          <Box sx={{ height: 200, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ fontSize: '3rem' }}>💿</Typography>
          </Box>
          <Chip label="-30%" color="secondary" size="small" sx={{ position: 'absolute', top: 12, left: 12 }} />
          <Box sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>OK Computer</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Radiohead — CD Remasterizado</Typography>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#dc454d' }}>$12.990</Typography>
              <Typography variant="body2" sx={{ textDecoration: 'line-through', color: '#999' }}>$18.990</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Button variant="contained" size="small" color="primary">Comprar</Button>
              <IconButton size="small"><FavoriteIcon sx={{ fontSize: 18, color: '#dc454d' }} /></IconButton>
            </Stack>
          </Box>
        </Paper>

        {/* Card 3 - Sold out */}
        <Paper sx={{ overflow: 'hidden', position: 'relative', opacity: 0.7 }}>
          <Box sx={{ height: 200, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ fontSize: '3rem' }}>🎵</Typography>
          </Box>
          <Chip label="Agotado" color="default" size="small" sx={{ position: 'absolute', top: 12, left: 12 }} />
          <Box sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Abbey Road</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>The Beatles — LP Edición 50 años</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              <CheckCircleIcon sx={{ fontSize: 13, color: '#22c55e', mr: 0.5, verticalAlign: 'middle' }} />
              Avisarme cuando haya stock
            </Typography>
            <Button variant="outlined" size="small" fullWidth disabled>Sin stock</Button>
          </Box>
        </Paper>
      </Box>

      {/* Notification / Banner examples */}
      <Typography variant="h5" sx={{ mb: 3 }}>Banners & Notificaciones</Typography>
      <Stack spacing={2} sx={{ mb: 6 }}>
        <Paper sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2, background: '#fff5f5', border: '1px solid #dc454d' }}>
          <LocalFireDepartmentIcon sx={{ color: '#dc454d' }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>¡Hot Sale activo!</Typography>
            <Typography variant="body2" color="text.secondary">Hasta 40% en LPs seleccionados. Termina en 2h 34m.</Typography>
          </Box>
          <Button variant="contained" color="secondary" size="small">Ver ofertas</Button>
        </Paper>

        <Paper sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2, background: '#f0fdf4', border: '1px solid #22c55e' }}>
          <CheckCircleIcon sx={{ color: '#22c55e' }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Pedido confirmado</Typography>
            <Typography variant="body2" color="text.secondary">Tu pedido #4521 está en camino. Llegará el 8 de mayo.</Typography>
          </Box>
          <Button variant="outlined" size="small">Rastrear</Button>
        </Paper>

        <Paper sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2, background: '#f5f5f5' }}>
          <NewReleasesIcon sx={{ color: '#282d35' }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Nuevos lanzamientos</Typography>
            <Typography variant="body2" color="text.secondary">12 discos nuevos esta semana. ¿Ya los viste?</Typography>
          </Box>
          <Button variant="contained" size="small">Explorar</Button>
        </Paper>
      </Stack>

      {/* Mini cart / order summary */}
      <Typography variant="h5" sx={{ mb: 3 }}>Carrito / Resumen</Typography>
      <Paper sx={{ p: 4, maxWidth: 420, width: '100%', mb: 6 }}>
        <Stack spacing={2.5}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar variant="rounded" sx={{ width: 48, height: 48, background: '#282d35', fontSize: '1.2rem' }}>🎸</Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Dark Side of the Moon</Typography>
              <Typography variant="body2" color="text.secondary">LP × 1</Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>$34.990</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar variant="rounded" sx={{ width: 48, height: 48, background: '#f5f5f5', fontSize: '1.2rem' }}>💿</Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>OK Computer</Typography>
              <Typography variant="body2" color="text.secondary">CD × 2</Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>$25.980</Typography>
          </Stack>
          <Divider sx={{ my: 0.5 }} />
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">Subtotal</Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>$60.970</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">Envío</Typography>
            <Chip label="Gratis" size="small" sx={{ background: '#f0fdf4', color: '#16a34a', fontWeight: 700, border: '1px solid #bbf7d0' }} />
          </Stack>
          <Divider sx={{ my: 0.5 }} />
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Total</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>$60.970</Typography>
          </Stack>
          <Box sx={{ pt: 1 }}>
            <Button variant="contained" color="primary" fullWidth size="large">
              Finalizar compra
            </Button>
          </Box>
          <Button variant="text" fullWidth size="small">Seguir comprando</Button>
        </Stack>
      </Paper>

      {/* Progress / engagement */}
      <Typography variant="h5" sx={{ mb: 3 }}>Progreso & Engagement</Typography>
      <Paper sx={{ p: 3, maxWidth: 400 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          🎯 ¡Casi llegas al envío gratis!
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Te faltan $9.030 para envío gratis
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={75} 
          sx={{ 
            height: 8, 
            borderRadius: 50, 
            background: '#e5e5e5',
            '& .MuiLinearProgress-bar': { background: '#dc454d', borderRadius: 50 }
          }} 
        />
        <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">$60.970</Typography>
          <Typography variant="body2" sx={{ color: '#111', fontWeight: 600 }}>$70.000</Typography>
        </Stack>
      </Paper>
    </Box>
  )
}

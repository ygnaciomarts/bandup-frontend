import { Box, Typography, Paper } from '@mui/material'

/**
 * Reusable empty state with icon, title, subtitle, and optional action.
 * 
 * Usage:
 *   <EmptyState
 *     icon={<ShoppingBagIcon />}
 *     title="Tu carrito está vacío"
 *     subtitle="Agrega productos para comenzar"
 *     action={<BtnPrimary>Ver catálogo</BtnPrimary>}
 *   />
 */
export default function EmptyState({ icon, title, subtitle, action, sx }) {
  return (
    <Paper variant="outlined" sx={{
      borderRadius: 3, py: 8, px: 3, textAlign: 'center',
      ...sx,
    }}>
      {icon && (
        <Box sx={{
          width: 64, height: 64, borderRadius: '50%', bgcolor: 'grey.100',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          mx: 'auto', mb: 2.5, color: 'text.disabled',
        }}>
          {icon}
        </Box>
      )}
      {title && (
        <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
          {title}
        </Typography>
      )}
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: action ? 3 : 0 }}>
          {subtitle}
        </Typography>
      )}
      {action}
    </Paper>
  )
}

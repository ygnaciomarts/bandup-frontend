import { Box, Typography } from '@mui/material'

/**
 * Consistent page header across all views.
 * 
 * Usage:
 *   <PageHeader title="Mi Wishlist" subtitle="4 productos" action={<Button>...</Button>} />
 */
export function PageHeader({ title, subtitle, action, sx }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, ...sx }}>
      <Box>
        <Typography variant="h5" fontWeight={800} sx={{ lineHeight: 1.2 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.3 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{action}</Box>}
    </Box>
  )
}

/**
 * Standard white card section container.
 * 
 * Usage:
 *   <PageSection title="Dirección de envío">
 *     <TextField ... />
 *   </PageSection>
 */
export function PageSection({ title, action, children, sx }) {
  return (
    <Box sx={{
      bgcolor: '#fff',
      border: '1px solid #f0f0f0',
      borderRadius: 2.5,
      overflow: 'hidden',
      ...sx,
    }}>
      {title && (
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 2.5, pt: 2.5, pb: 0,
        }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{
            textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.72rem', color: '#6b7280'
          }}>
            {title}
          </Typography>
          {action}
        </Box>
      )}
      <Box sx={{ px: 2.5, py: 2.5 }}>
        {children}
      </Box>
    </Box>
  )
}

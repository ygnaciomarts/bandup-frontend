import { useQuery } from '@tanstack/react-query'
import {
  Box, Typography, Chip, Skeleton,
  Accordion, AccordionSummary, AccordionDetails, Divider
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { api } from '../services/api'

export default function AdminOrders() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: () => api.adminGetOrders(),
  })

  const orders = data?.orders || []

  if (isLoading) {
    return (
      <Box>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={`skel-${i}`} height={56} sx={{ mb: 1, borderRadius: 2 }} />
        ))}
      </Box>
    )
  }

  if (orders.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="body2" color="text.secondary">No hay órdenes.</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {orders.map(order => (
        <Accordion
          key={order.id}
          disableGutters
          elevation={0}
          sx={{
            border: '1px solid #f0f0f0',
            borderRadius: '8px !important',
            '&:before': { display: 'none' },
            '&.Mui-expanded': { margin: 0 },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />} sx={{ px: 2, minHeight: 56 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 1, gap: 2, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="body2" fontWeight={600}>Orden #{order.id}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {order.usuario || '—'} · {order.email || '—'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {new Date(order.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Typography>
                <Typography variant="body2" fontWeight={700}>${order.total?.toLocaleString('es-MX')}</Typography>
                <Chip
                  label={order.estado}
                  size="small"
                  sx={{
                    fontWeight: 600, fontSize: '0.68rem',
                    bgcolor: order.estado === 'completado' ? '#ecfdf5' : order.estado === 'enviado' ? '#eff6ff' : '#fef3c7',
                    color: order.estado === 'completado' ? '#059669' : order.estado === 'enviado' ? '#2563eb' : '#d97706',
                  }}
                />
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 2, pt: 0, pb: 2 }}>
            <Divider sx={{ mb: 1.5 }} />
            {order.items?.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                {order.items.map((item, i) => (
                  <Box key={`${order.id}-${item.id || i}`} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>{item.nombre}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.artista} · {item.tipo} · x{item.qty}</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={600}>${(item.precio * item.qty).toLocaleString('es-MX')}</Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">Sin detalle de productos</Typography>
            )}
            <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid #f5f5f5', display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Typography variant="caption" color="text.secondary">
                Envío: {order.envio === 0 ? 'Gratis' : `$${order.envio?.toLocaleString('es-MX') || '—'}`}
              </Typography>
              {order.tracking && (
                <Typography variant="caption" color="text.secondary">
                  Guía: <strong>{order.carrier}</strong> {order.tracking}
                </Typography>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  )
}

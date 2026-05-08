import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Container, Typography, Avatar, Button, Box, Chip, Skeleton, Divider,
  Accordion, AccordionSummary, AccordionDetails, TextField, Switch
} from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'

export default function MyAccount() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [editingProfile, setEditingProfile] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const fileInputRef = useRef(null)

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.getProfile(),
    enabled: !!user,
  })

  const { data: ordersData, isLoading: loadingOrders } = useQuery({
    queryKey: ['orders'],
    queryFn: () => api.getOrders(),
    enabled: !!user,
  })

  if (!user) {
    return null
  }

  const orders = ordersData?.orders || []
  const userData = profile || user

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ bgcolor: '#fff', borderRadius: 3, border: '1px solid #f0f0f0', overflow: 'hidden' }}>

      {/* Profile header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, p: 3, pb: 2.5 }}>
        {loadingProfile ? (
          <>
            <Skeleton variant="circular" width={56} height={56} />
            <Box>
              <Skeleton width={120} />
              <Skeleton width={180} />
            </Box>
          </>
        ) : (
          <>
            <Box
              sx={{ position: 'relative', cursor: 'pointer', '&:hover .avatar-overlay': { opacity: 1 } }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Avatar
                src={avatarPreview || undefined}
                sx={{ width: 56, height: 56, bgcolor: '#282d35', fontSize: 20, fontWeight: 700 }}
              >
                {!avatarPreview && (userData.nombre?.[0] || '?')}
              </Avatar>
              <Box
                className="avatar-overlay"
                sx={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  bgcolor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: 0, transition: 'opacity 0.2s',
                }}
              >
                <CameraAltOutlinedIcon sx={{ fontSize: 18, color: '#fff' }} />
              </Box>
            </Box>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) setAvatarPreview(URL.createObjectURL(file))
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#282d35' }}>
                {userData.nombre} {userData.apellido || ''}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {userData.email}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<LogoutIcon />}
              onClick={() => { logout(); navigate('/') }}
              sx={{ color: '#6b7280', borderColor: '#e5e5e5', '&:hover': { borderColor: '#282d35', color: '#282d35' } }}
            >
              Salir
            </Button>
          </>
        )}
      </Box>

      <Divider />

      {/* Profile settings */}
      <Box sx={{ px: 3, py: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#282d35', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.72rem' }}>
            Información personal
          </Typography>
          <Button
            size="small"
            startIcon={<EditOutlinedIcon sx={{ fontSize: 14 }} />}
            onClick={() => setEditingProfile(!editingProfile)}
            sx={{ color: '#6b7280', fontSize: '0.72rem' }}
          >
            {editingProfile ? 'Cancelar' : 'Editar'}
          </Button>
        </Box>

        {editingProfile ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Nombre" size="small" fullWidth defaultValue={userData.nombre || ''} />
              <TextField label="Apellido" size="small" fullWidth defaultValue={userData.apellido || ''} />
            </Box>
            <TextField label="Email" size="small" fullWidth defaultValue={userData.email || ''} />
            <TextField label="Teléfono" size="small" fullWidth defaultValue={userData.telefono || ''} placeholder="+52 (55) 1234-5678" />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
              <Button variant="contained" color="primary" size="small">
                Guardar cambios
              </Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Nombre</Typography>
              <Typography variant="body2" fontWeight={500}>{userData.nombre} {userData.apellido || ''}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Email</Typography>
              <Typography variant="body2" fontWeight={500}>{userData.email}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Teléfono</Typography>
              <Typography variant="body2" fontWeight={500}>{userData.telefono || '—'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Miembro desde</Typography>
              <Typography variant="body2" fontWeight={500}>{userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }) : '—'}</Typography>
            </Box>
          </Box>
        )}
      </Box>

      <Divider />

      {/* Preferences */}
      <Box sx={{ px: 3, py: 2.5 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#282d35', mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.72rem' }}>
          Preferencias
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}>
            <Box>
              <Typography variant="body2" fontWeight={600}>Notificaciones por email</Typography>
              <Typography variant="caption" color="text.secondary">Recibe ofertas y novedades</Typography>
            </Box>
            <Switch defaultChecked size="small" />
          </Box>
          <Divider />
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}>
            <Box>
              <Typography variant="body2" fontWeight={600}>Alertas de restock</Typography>
              <Typography variant="caption" color="text.secondary">Avísame cuando vuelva a estar disponible</Typography>
            </Box>
            <Switch size="small" />
          </Box>
          <Divider />
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}>
            <Box>
              <Typography variant="body2" fontWeight={600}>Preventa exclusiva</Typography>
              <Typography variant="caption" color="text.secondary">Acceso anticipado a lanzamientos</Typography>
            </Box>
            <Switch defaultChecked size="small" />
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* Orders */}
      <Box sx={{ px: 3, py: 2.5 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#282d35', mb: 2, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.72rem' }}>
          Mis órdenes
        </Typography>

        {loadingOrders ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={50} sx={{ mb: 1, borderRadius: 2 }} />)
        ) : orders.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Box sx={{
              width: 48, height: 48, borderRadius: '50%', bgcolor: '#f5f5f5',
              display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5
            }}>
              <LocalShippingOutlinedIcon sx={{ fontSize: 20, color: '#9ca3af' }} />
            </Box>
            <Typography variant="body2" color="text.secondary">
              No tienes órdenes aún.
            </Typography>
          </Box>
        ) : (
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
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />} sx={{ px: 2, minHeight: 52 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 1 }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>Orden #{order.id}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(order.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Typography variant="body2" fontWeight={700}>${order.total.toLocaleString('es-MX')}</Typography>
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
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {order.items.map((item, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: '#f5f5f5', overflow: 'hidden', flexShrink: 0 }}>
                            {item.cover && <img src={`data:image/jpeg;base64,${item.cover}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={500} noWrap>{item.nombre}</Typography>
                            <Typography variant="caption" color="text.secondary">{item.artista} · x{item.qty}</Typography>
                          </Box>
                          <Typography variant="body2" fontWeight={600}>${(item.precio * item.qty).toLocaleString('es-MX')}</Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {order.totalItems || '—'} producto(s)
                    </Typography>
                  )}
                  <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Envío: {order.shipping === 0 || order.envio === 0 ? 'Gratis' : `$${(order.shipping || order.envio)?.toLocaleString('es-MX') || '—'}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Pago: {order.metodoPago || 'Tarjeta'}
                    </Typography>
                  </Box>
                  {order.tracking && (
                    <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#f9fafb', borderRadius: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <LocalShippingOutlinedIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ color: '#6b7280' }}>
                          {order.carrier || 'Paquetería'} · Guía:
                        </Typography>
                        <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace', letterSpacing: 0.5 }}>
                          {order.tracking}
                        </Typography>
                      </Box>
                      <Box
                        component="button"
                        onClick={() => navigator.clipboard.writeText(order.tracking)}
                        sx={{ border: 'none', bgcolor: 'transparent', cursor: 'pointer', p: 0.5, borderRadius: 1, '&:hover': { bgcolor: '#e5e7eb' } }}
                      >
                        <ContentCopyOutlinedIcon sx={{ fontSize: 14, color: '#9ca3af' }} />
                      </Box>
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}
      </Box>

      </Box>{/* end card */}
    </Container>
  )
}

import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Container, Typography, Avatar, Button, Box, Chip, Skeleton, Divider,
  Accordion, AccordionSummary, AccordionDetails, TextField, Switch, CircularProgress
} from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import AddIcon from '@mui/icons-material/Add'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import { api } from '../services/api'
import { PageHeader } from '../components/ui'

export default function MyAccount() {
  const { user, logout } = useAuth()
  const { notify } = useNotification()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({ nombre: '', apellido: '', usuario: '', phone_number: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({ current: '', nueva: '', confirmar: '' })
  const [passwordError, setPasswordError] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [editingAddress, setEditingAddress] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
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

  const startEditingProfile = () => {
    setProfileForm({
      nombre: userData.nombre || '',
      apellido: userData.apellido || '',
      usuario: userData.usuario || '',
      phone_number: userData.phone_number || userData.telefono || '',
    })
    setEditingProfile(true)
  }

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    try {
      await api.updateProfile(profileForm)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      notify('Perfil actualizado correctamente', 'success')
      setEditingProfile(false)
    } catch (err) {
      notify(err.message || 'Error al guardar cambios', 'error')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleAvatarUpload = async (file) => {
    if (!file) return

    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
      'image/gif'
    ]

    if (!allowedTypes.includes(file.type)) {
      notify('Formato de imagen no permitido', 'warning')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      notify('La imagen no puede superar los 5MB', 'warning')
      return
    }

    const previewUrl = URL.createObjectURL(file)
    setAvatarPreview(previewUrl)

    try {
      setUploadingAvatar(true)
      await api.uploadAvatar(file)
      notify('Foto actualizada', 'success')
    } catch (err) {
      console.error(err)
      notify(err.message || 'No se pudo actualizar la foto de perfil', 'error')
    } finally {
      setUploadingAvatar(false)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <PageHeader title="Mi cuenta" />
      <Box sx={{ bgcolor: '#fff', borderRadius: 2.5, border: '1px solid #f0f0f0', overflow: 'hidden' }}>

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
                  src={
                    avatarPreview ||
                    (userData.avatar_url
                      ? userData.avatar_url
                      : undefined)
                  }
                  sx={{ width: 56, height: 56, bgcolor: '#282d35', fontSize: 20, fontWeight: 700 }}
                >
                  {!avatarPreview && (userData.nombre?.[0] || '?')}
                </Avatar>
                <Box
                  className="avatar-overlay"
                  sx={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    bgcolor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: uploadingAvatar ? 1 : 0, transition: 'opacity 0.2s',
                    pointerEvents: uploadingAvatar ? 'none' : 'auto',
                  }}
                >
                  {uploadingAvatar
                    ? <CircularProgress size={22} sx={{ color: '#fff' }} />
                    : <CameraAltOutlinedIcon sx={{ fontSize: 18, color: '#fff' }} />
                  }
                </Box>
              </Box>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleAvatarUpload(file)
                  }
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
              onClick={() => editingProfile ? setEditingProfile(false) : startEditingProfile()}
              sx={{ color: '#6b7280', fontSize: '0.72rem' }}
            >
              {editingProfile ? 'Cancelar' : 'Editar'}
            </Button>
          </Box>

          {editingProfile ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField label="Nombre" size="small" fullWidth value={profileForm.nombre} onChange={(e) => setProfileForm(f => ({ ...f, nombre: e.target.value }))} />
                <TextField label="Apellido" size="small" fullWidth value={profileForm.apellido} onChange={(e) => setProfileForm(f => ({ ...f, apellido: e.target.value }))} />
              </Box>
              <TextField label="Nombre de usuario" size="small" fullWidth value={profileForm.usuario} onChange={(e) => setProfileForm(f => ({ ...f, usuario: e.target.value }))} placeholder="tu_username" />
              <TextField label="Teléfono" size="small" fullWidth value={profileForm.phone_number} onChange={(e) => setProfileForm(f => ({ ...f, phone_number: e.target.value }))} placeholder="+52 (55) 1234-5678" />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
                <Button variant="contained" color="primary" size="small" onClick={handleSaveProfile} disabled={savingProfile || !profileForm.nombre.trim()}>
                  {savingProfile ? <CircularProgress size={18} /> : 'Guardar cambios'}
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
                <Typography variant="caption" color="text.secondary">Nombre de usuario</Typography>
                <Typography variant="body2" fontWeight={500}>{userData.usuario ? `@${userData.usuario}` : '—'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Teléfono</Typography>
                <Typography variant="body2" fontWeight={500}>{userData.phone_number || userData.telefono || '—'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Miembro desde</Typography>
                <Typography variant="body2" fontWeight={500}>{userData.creado ? new Date(userData.creado).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }) : '—'}</Typography>
              </Box>
            </Box>
          )}
        </Box>

        <Divider />

        {/* Change password */}
        <Box sx={{ px: 3, py: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#282d35', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.72rem' }}>
              Seguridad
            </Typography>
            {!changingPassword && (
              <Button
                size="small"
                startIcon={<LockOutlinedIcon sx={{ fontSize: 14 }} />}
                onClick={() => setChangingPassword(true)}
                sx={{ color: '#6b7280', fontSize: '0.72rem' }}
              >
                Cambiar contraseña
              </Button>
            )}
          </Box>

          {changingPassword ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {passwordError && (
                <Typography variant="caption" color="error" sx={{ fontWeight: 500 }}>
                  {passwordError}
                </Typography>
              )}
              <TextField
                label="Contraseña actual"
                type="password"
                size="small"
                fullWidth
                value={passwordData.current}
                onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
              />
              <TextField
                label="Nueva contraseña"
                type="password"
                size="small"
                fullWidth
                value={passwordData.nueva}
                onChange={(e) => setPasswordData(prev => ({ ...prev, nueva: e.target.value }))}
              />
              <TextField
                label="Confirmar nueva contraseña"
                type="password"
                size="small"
                fullWidth
                value={passwordData.confirmar}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmar: e.target.value }))}
                error={passwordData.confirmar.length > 0 && passwordData.nueva !== passwordData.confirmar}
                helperText={passwordData.confirmar.length > 0 && passwordData.nueva !== passwordData.confirmar ? 'Las contraseñas no coinciden' : ''}
              />
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 0.5 }}>
                <Button
                  size="small"
                  onClick={() => { setChangingPassword(false); setPasswordData({ current: '', nueva: '', confirmar: '' }); setPasswordError('') }}
                  sx={{ color: '#6b7280' }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  disabled={passwordLoading || !passwordData.current || !passwordData.nueva || passwordData.nueva !== passwordData.confirmar || passwordData.nueva.length < 6}
                  onClick={async () => {
                    setPasswordError('')
                    setPasswordLoading(true)
                    try {
                      await api.changePassword(passwordData.current, passwordData.nueva)
                      notify('Contraseña actualizada correctamente', 'success')
                      setChangingPassword(false)
                      setPasswordData({ current: '', nueva: '', confirmar: '' })
                    } catch (err) {
                      setPasswordError(err.message || 'No se pudo cambiar la contraseña')
                    } finally {
                      setPasswordLoading(false)
                    }
                  }}
                >
                  {passwordLoading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : 'Actualizar contraseña'}
                </Button>
              </Box>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem' }}>
              Cambia tu contraseña periódicamente para mantener tu cuenta segura.
            </Typography>
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

      {/* Saved addresses - separate card */}
      <Box sx={{ bgcolor: '#fff', borderRadius: 2.5, border: '1px solid #f0f0f0', overflow: 'hidden', mt: 2.5 }}>
        <Box sx={{ px: 3, py: 2.5 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#282d35', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.72rem', mb: 1.5 }}>
            Direcciones de envío
          </Typography>

          {editingAddress ? (
            <Box sx={{ border: '1px solid #e5e7eb', borderRadius: 2.5, p: 2.5, bgcolor: '#fafafa' }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 2, color: '#282d35' }}>
                Nueva dirección
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  label="Alias"
                  size="small"
                  fullWidth
                  placeholder="Ej: Casa, Oficina"
                  helperText="Para identificar esta dirección"
                  InputProps={{ startAdornment: <HomeOutlinedIcon sx={{ fontSize: 16, color: '#9ca3af', mr: 1 }} /> }}
                />
                <TextField
                  label="Nombre del destinatario"
                  size="small"
                  fullWidth
                  placeholder="Nombre completo"
                />
                <TextField
                  label="Calle y número"
                  size="small"
                  fullWidth
                  placeholder="Av. Reforma 123"
                  sx={{ gridColumn: { sm: '1 / -1' } }}
                />
                <TextField
                  label="Colonia"
                  size="small"
                  fullWidth
                  placeholder="Col. Centro"
                />
                <TextField
                  label="Ciudad"
                  size="small"
                  fullWidth
                />
                <TextField
                  label="Estado"
                  size="small"
                  fullWidth
                />
                <TextField
                  label="Código Postal"
                  size="small"
                  fullWidth
                  inputProps={{ maxLength: 5 }}
                  placeholder="00000"
                />
                <TextField
                  label="Teléfono de contacto"
                  size="small"
                  fullWidth
                  placeholder="55 1234 5678"
                />
                <TextField
                  label="Referencias (opcional)"
                  size="small"
                  fullWidth
                  placeholder="Entre calles, edificio, etc."
                  sx={{ gridColumn: { sm: '1 / -1' } }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2.5 }}>
                <Button size="small" onClick={() => setEditingAddress(false)} sx={{ color: '#6b7280' }}>
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => { notify('Funcionalidad próximamente disponible', 'info'); setEditingAddress(false) }}
                >
                  Guardar dirección
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {/* Placeholder - will come from API */}
              <Box
                onClick={() => setEditingAddress(true)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  p: 3,
                  border: '2px dashed #e5e7eb',
                  borderRadius: 2.5,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: '#9ca3af', bgcolor: '#f9fafb' },
                }}
              >
                <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AddIcon sx={{ fontSize: 20, color: '#6b7280' }} />
                </Box>
                <Typography variant="body2" fontWeight={600} sx={{ color: '#4b5563' }}>
                  Agregar dirección
                </Typography>
                <Typography variant="caption" color="text.secondary" textAlign="center">
                  Guarda tus direcciones para agilizar el checkout
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Danger zone */}
      <Box sx={{ bgcolor: '#fff', borderRadius: 2.5, border: '1px solid #fecaca', overflow: 'hidden', mt: 2.5 }}>
        <Box sx={{ px: 3, py: 2.5 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#dc2626', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.72rem', mb: 1.5 }}>
            Opciones avanzadas
          </Typography>

          {showDeleteConfirm ? (
            <Box sx={{ p: 2, bgcolor: '#fef2f2', borderRadius: 2, border: '1px solid #fecaca' }}>
              <Typography variant="body2" fontWeight={600} sx={{ color: '#dc2626', mb: 0.5 }}>
                ¿Estás seguro?
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Esta acción es irreversible. Se eliminarán todos tus datos, historial de órdenes y preferencias.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  onClick={() => setShowDeleteConfirm(false)}
                  sx={{ color: '#6b7280' }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  color="error"
                  startIcon={<DeleteOutlineIcon sx={{ fontSize: 14 }} />}
                  onClick={() => {
                    notify('Funcionalidad próximamente disponible', 'info')
                    setShowDeleteConfirm(false)
                  }}
                >
                  Sí, eliminar
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" fontWeight={600} sx={{ color: '#dc2626', fontSize: '0.82rem' }}>
                  Eliminar cuenta
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Se borrarán permanentemente tus datos, órdenes y preferencias.
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={() => setShowDeleteConfirm(true)}
                sx={{ fontSize: '0.72rem', whiteSpace: 'nowrap', ml: 2 }}
              >
                Eliminar
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  )
}

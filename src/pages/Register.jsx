import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  TextField, Button, Typography, Alert, Box,
  InputAdornment, IconButton, LinearProgress
} from '@mui/material'
import {
  Person, Lock, Email, Badge, Visibility, VisibilityOff,
  MusicNote, AlbumOutlined, HeadphonesOutlined, ArrowForward
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'

export default function Register() {
  const { register: authRegister, openLoginModal } = useAuth()
  const { notify } = useNotification()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm()

  const password = watch('password', '')
  const getPasswordStrength = (pw) => {
    if (!pw) return 0
    let s = 0
    if (pw.length >= 8) s += 25
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s += 25
    if (/\d/.test(pw)) s += 25
    if (/[^a-zA-Z0-9]/.test(pw)) s += 25
    return s
  }
  const strength = getPasswordStrength(password)
  const strengthLabel = strength <= 25 ? 'Débil' : strength <= 50 ? 'Regular' : strength <= 75 ? 'Buena' : 'Fuerte'
  const strengthColor = strength <= 25 ? '#ef4444' : strength <= 50 ? '#f59e0b' : strength <= 75 ? '#3b82f6' : '#22c55e'

  const onSubmit = async (data) => {
    setError('')
    try {
      await authRegister(data)
      notify('Tu cuenta ha sido creada — ya puedes iniciar sesión')
      navigate('/')
    } catch (err) {
      setError(err.errors?.join(', ') || err.error || err.message || 'Error al registrarse')
    }
  }

  return (
    <Box sx={{
      minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center',
      background: 'linear-gradient(160deg, #282d35 0%, #1a1e24 100%)',
      position: 'relative', overflow: 'hidden',
      px: { xs: 2, sm: 4, md: 8, lg: 12 }, py: 4,
    }}>
      {/* Giant & background */}
      <Box
        component="img"
        src="/img/BandUp.svg"
        alt=""
        sx={{
          position: 'absolute',
          left: { md: '-5%', lg: '0%' },
          top: '50%',
          transform: 'translateY(-50%)',
          height: '85%',
          opacity: 0.06,
          filter: 'brightness(0) invert(1)',
          pointerEvents: 'none',
          display: { xs: 'none', md: 'block' },
        }}
      />

      {/* Left branding text */}
      <Box sx={{
        flex: 1, display: { xs: 'none', md: 'flex' },
        flexDirection: 'column', justifyContent: 'center',
        position: 'relative', zIndex: 1, pl: { md: 4, lg: 8 }, pr: 4,
      }}>
        <Typography variant="h3" sx={{ fontWeight: 800, color: '#fff', letterSpacing: '-1px', lineHeight: 1.2, mb: 2 }}>
          Tu música.<br />Tu estilo.<br />
          <Box component="span" sx={{ color: '#dc454d' }}>Tu comunidad.</Box>
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)', maxWidth: 340, lineHeight: 1.7, mb: 4 }}>
          Descubre vinilos y CDs exclusivos de tus artistas favoritos. Únete a miles de coleccionistas.
        </Typography>

        <Box sx={{ display: 'flex', gap: 3 }}>
          {[
            { icon: <AlbumOutlined sx={{ fontSize: 22 }} />, label: 'Vinilos' },
            { icon: <HeadphonesOutlined sx={{ fontSize: 22 }} />, label: 'Artistas' },
            { icon: <MusicNote sx={{ fontSize: 22 }} />, label: 'Ofertas' },
          ].map((item) => (
            <Box key={item.label} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{
                width: 44, height: 44, borderRadius: 2, bgcolor: 'rgba(220,69,77,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc454d',
              }}>
                {item.icon}
              </Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Form card */}
      <Box sx={{
        width: { xs: '100%', md: 440 }, minWidth: { md: 400 },
        bgcolor: '#fff', borderRadius: 4,
        p: { xs: 3, sm: 4 },
        boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
        position: 'relative', zIndex: 2,
      }}>
        {/* Mobile logo */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, textAlign: 'center', mb: 2 }}>
          <Box
            component="img"
            src="/img/BandUp.svg"
            alt="BandUp"
            sx={{ height: 28, mb: 1 }}
          />
        </Box>

        <Typography variant="h5" component="h1" sx={{ fontWeight: 800, color: '#282d35', mb: 0.5 }}>
          Crear cuenta
        </Typography>
        <Typography variant="body2" sx={{ color: '#6b7280', mb: 3 }}>
          Completa tus datos para unirte
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <TextField
              label="Nombre"
              fullWidth
              size="small"
              {...register('nombre', { required: 'Requerido' })}
              error={!!errors.nombre}
              helperText={errors.nombre?.message}
              InputProps={{ startAdornment: <InputAdornment position="start"><Badge sx={{ color: '#bbb', fontSize: 20 }} /></InputAdornment> }}
            />
            <TextField
              label="Apellido"
              fullWidth
              size="small"
              {...register('apellido')}
              InputProps={{ startAdornment: <InputAdornment position="start"><Badge sx={{ color: '#bbb', fontSize: 20 }} /></InputAdornment> }}
            />
          </Box>
          <TextField
            label="Usuario"
            fullWidth
            size="small"
            {...register('username', { required: 'El usuario es requerido' })}
            error={!!errors.username}
            helperText={errors.username?.message}
            InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ color: '#bbb', fontSize: 20 }} /></InputAdornment> }}
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            size="small"
            {...register('email', { required: 'El email es requerido', pattern: { value: /^\S+@\S+$/i, message: 'Email inválido' } })}
            error={!!errors.email}
            helperText={errors.email?.message}
            InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: '#bbb', fontSize: 20 }} /></InputAdornment> }}
          />
          <TextField
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            size="small"
            {...register('password', { required: 'Requerida', minLength: { value: 8, message: 'Mín. 8 caracteres' } })}
            error={!!errors.password}
            helperText={errors.password?.message}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#bbb', fontSize: 20 }} /></InputAdornment>,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {password && (
            <Box sx={{ mt: -1 }}>
              <LinearProgress
                variant="determinate"
                value={strength}
                sx={{
                  height: 4, borderRadius: 2, bgcolor: '#e8e8e8',
                  '& .MuiLinearProgress-bar': { bgcolor: strengthColor, borderRadius: 2 },
                }}
              />
              <Typography variant="caption" sx={{ color: strengthColor, fontWeight: 600, mt: 0.3, display: 'block' }}>
                {strengthLabel}
              </Typography>
            </Box>
          )}
          <TextField
            label="Confirmar contraseña"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            size="small"
            {...register('confirm_password', { required: 'Requerido', validate: (val) => val === watch('password') || 'No coinciden' })}
            error={!!errors.confirm_password}
            helperText={errors.confirm_password?.message}
            InputProps={{ startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#bbb', fontSize: 20 }} /></InputAdornment> }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            fullWidth
            endIcon={!isSubmitting && <ArrowForward sx={{ fontSize: 18 }} />}
            sx={{
              mt: 1, py: 1.4, borderRadius: 6, fontWeight: 700, fontSize: '0.95rem',
              background: 'linear-gradient(135deg, #dc454d, #c03a42)',
              boxShadow: '0 4px 16px rgba(220,69,77,0.25)',
              '&:hover': { background: 'linear-gradient(135deg, #c03a42, #a83038)', boxShadow: '0 6px 20px rgba(220,69,77,0.35)' },
            }}
          >
            {isSubmitting ? 'Creando cuenta...' : 'Crear mi cuenta'}
          </Button>
        </Box>

        <Typography sx={{ color: '#6b7280', textAlign: 'center', mt: 3, fontSize: '0.85rem' }}>
          ¿Ya tienes cuenta?{' '}
          <Box component="span" onClick={openLoginModal} sx={{ color: '#dc454d', fontWeight: 700, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
            Inicia sesión
          </Box>
        </Typography>
      </Box>
    </Box>
  )
}

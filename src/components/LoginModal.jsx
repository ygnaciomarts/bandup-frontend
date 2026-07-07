import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  Dialog, DialogContent, TextField, Typography, Alert, Box,
  InputAdornment, IconButton
} from '@mui/material'
import { Visibility, VisibilityOff, Close } from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import { BtnAuth } from './ui/Buttons'


export default function LoginModal() {
  const { login, loginModalOpen, closeLoginModal, openRegisterModal } = useAuth()
  const { notify } = useNotification()
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm()

  const onSubmit = async (data) => {
    setError('')
    try {
      const { user: loggedUser } = await login(data)
      reset()
      closeLoginModal()
      const name = loggedUser?.nombre?.split(' ')[0] || ''
      const greetings = [
        `¡Qué onda, ${name}! 🤘`,
        `¡${name} está en el edificio! 🎸`,
        `Welcome back, ${name} 🎶`,
        `¡Arriba ${name}! Ya estás dentro 🔥`,
      ]
      notify(greetings[Math.floor(Math.random() * greetings.length)])
    } catch (err) {
      setError(err.error || err.message || 'Error al iniciar sesión')
    }
  }

  const handleClose = () => {
    setError('')
    reset()
    closeLoginModal()
  }

  return (
    <Dialog
      open={loginModalOpen}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, p: 0 }
      }}
    >
      <DialogContent sx={{ p: { xs: 3, sm: 4 }, position: 'relative' }}>
        {/* Close button */}
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{ position: 'absolute', top: 12, right: 12, color: 'text.disabled' }}
        >
          <Close fontSize="small" />
        </IconButton>

        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Iniciar sesión
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Ingresa a tu cuenta BandUp
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2.5, mt: 0.5, borderRadius: 2, fontSize: '0.82rem' }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Usuario"
            placeholder="Tu nombre de usuario"
            size="small"
            {...register('username', { required: 'El usuario es requerido' })}
            error={!!errors.username}
            helperText={errors.username?.message}
            autoComplete="off"
          />
          <TextField
            label="Contraseña"
            placeholder="Tu contraseña"
            type={showPassword ? 'text' : 'password'}
            size="small"
            {...register('password', { required: 'La contraseña es requerida' })}
            error={!!errors.password}
            helperText={errors.password?.message}
            autoComplete="off"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <BtnAuth type="submit" disabled={isSubmitting} sx={{ mt: 0.5 }}>
            {isSubmitting ? 'Entrando...' : 'Iniciar sesión'}
          </BtnAuth>

          <Typography sx={{ textAlign: 'center', mt: -1 }}>
            <Link to="/forgot-password" onClick={handleClose} style={{ color: 'inherit', fontSize: '0.78rem', textDecoration: 'none', opacity: 0.6 }}>
              ¿Olvidaste tu contraseña?
            </Link>
          </Typography>
        </Box>

        <Typography sx={{ color: 'text.secondary', textAlign: 'center', mt: 3, fontSize: '0.85rem' }}>
          ¿No tienes cuenta?{' '}
          <Box component="span" onClick={() => { handleClose(); openRegisterModal() }} sx={{ fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
            Regístrate
          </Box>
        </Typography>

        <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: 'grey.100', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Demo: <strong>demo / demo123</strong> &nbsp;|&nbsp; Admin: <strong>admin / admin123</strong>
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

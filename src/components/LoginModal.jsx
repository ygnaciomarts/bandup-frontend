import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  Dialog, DialogContent, TextField, Button, Typography, Alert, Box,
  InputAdornment, IconButton
} from '@mui/material'
import { Visibility, VisibilityOff, Close } from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'

export default function LoginModal() {
  const { login, loginModalOpen, closeLoginModal } = useAuth()
  const { notify } = useNotification()
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm()

  const onSubmit = async (data) => {
    setError('')
    try {
      await login(data)
      reset()
      closeLoginModal()
      notify('Has iniciado sesión correctamente')
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
          sx={{ position: 'absolute', top: 12, right: 12, color: '#999' }}
        >
          <Close fontSize="small" />
        </IconButton>

        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#282d35' }}>
            Iniciar sesión
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>
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
            autoComplete="username"
          />
          <TextField
            label="Contraseña"
            placeholder="Tu contraseña"
            type={showPassword ? 'text' : 'password'}
            size="small"
            {...register('password', { required: 'La contraseña es requerida' })}
            error={!!errors.password}
            helperText={errors.password?.message}
            autoComplete="current-password"
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
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            fullWidth
            sx={{ mt: 0.5 }}
          >
            {isSubmitting ? 'Entrando...' : 'Iniciar sesión'}
          </Button>

          <Typography sx={{ textAlign: 'right', mt: -1 }}>
            <Link to="/forgot-password" onClick={handleClose} style={{ color: '#6b7280', fontSize: '0.78rem', textDecoration: 'none' }}>
              ¿Olvidaste tu contraseña?
            </Link>
          </Typography>
        </Box>

        <Typography sx={{ color: '#6b7280', textAlign: 'center', mt: 3, fontSize: '0.85rem' }}>
          ¿No tienes cuenta?{' '}
          <Link to="/register" onClick={handleClose} style={{ color: '#282d35', fontWeight: 600, textDecoration: 'none' }}>
            Regístrate
          </Link>
        </Typography>

        <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: '#f5f5f5', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#6b7280' }}>
            Demo: <strong>demo / demo123</strong> &nbsp;|&nbsp; Admin: <strong>admin / admin123</strong>
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

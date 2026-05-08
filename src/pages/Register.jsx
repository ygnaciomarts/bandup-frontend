import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  Container, TextField, Button, Typography, Alert, Box
} from '@mui/material'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'

export default function Register() {
  const { register: authRegister, openLoginModal } = useAuth()
  const { notify } = useNotification()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm()

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
    <Box sx={{ minHeight: 'calc(100vh - 200px)', display: 'flex', alignItems: 'center', py: 4 }}>
      <Container maxWidth="sm">
        <Box sx={{ background: '#fff', borderRadius: 3, p: { xs: 3, sm: 4 }, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', maxWidth: 400, mx: 'auto' }}>
          {/* Header */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" component="h1" sx={{ fontWeight: 700, color: '#282d35' }}>
              Crear cuenta
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.3 }}>
              Únete a la comunidad BandUp
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <TextField
                label="Nombre"
                fullWidth
                size="small"
                {...register('nombre', { required: 'Requerido' })}
                error={!!errors.nombre}
                helperText={errors.nombre?.message}
              />
              <TextField
                label="Apellido"
                fullWidth
                size="small"
                {...register('apellido')}
              />
            </Box>
            <TextField
              label="Usuario"
              fullWidth
              size="small"
              {...register('username', { required: 'El usuario es requerido' })}
              error={!!errors.username}
              helperText={errors.username?.message}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              size="small"
              {...register('email', { required: 'El email es requerido', pattern: { value: /^\S+@\S+$/i, message: 'Email inválido' } })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              label="Contraseña"
              type="password"
              fullWidth
              size="small"
              {...register('password', { required: 'Requerida', minLength: { value: 8, message: 'Mín. 8 caracteres' } })}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            <TextField
              label="Confirmar contraseña"
              type="password"
              fullWidth
              size="small"
              {...register('confirm_password', { required: 'Requerido', validate: (val) => val === watch('password') || 'No coinciden' })}
              error={!!errors.confirm_password}
              helperText={errors.confirm_password?.message}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              fullWidth
              sx={{ mt: 0.5 }}
            >
              {isSubmitting ? 'Creando...' : 'Crear cuenta'}
            </Button>
          </Box>

          <Typography sx={{ color: '#6b7280', textAlign: 'center', mt: 2, fontSize: '0.85rem' }}>
            ¿Ya tienes cuenta?{' '}
            <Box component="span" onClick={openLoginModal} sx={{ color: '#282d35', fontWeight: 600, cursor: 'pointer' }}>
              Inicia sesión
            </Box>
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}

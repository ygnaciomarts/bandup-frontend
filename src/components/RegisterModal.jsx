import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Dialog, DialogContent, TextField, Typography, Alert, Box,
  InputAdornment, IconButton, Grid, Stepper, Step, StepLabel
} from '@mui/material'
import { Person, Lock, Email, Badge, Close, MusicNote } from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import { BtnAuth, BtnOutlined } from './ui/Buttons'

const steps = ['Datos personales', 'Cuenta']

export default function RegisterModal() {
  const { register: authRegister, registerModalOpen, closeRegisterModal, openLoginModal } = useAuth()
  const { notify } = useNotification()
  const [error, setError] = useState('')
  const [activeStep, setActiveStep] = useState(0)
  const { register, handleSubmit, watch, formState: { errors, isSubmitting }, reset, trigger } = useForm()

  const handleNext = async () => {
    const valid = await trigger(['nombre', 'apellido'])
    if (valid) setActiveStep(1)
  }

  const onSubmit = async (data) => {
    setError('')
    try {
      await authRegister(data)
      reset()
      setActiveStep(0)
      closeRegisterModal()
      notify('¡Cuenta creada exitosamente! 🎉')
    } catch (err) {
      setError(err.errors?.join(', ') || err.error || err.message || 'Error al registrarse')
    }
  }

  const handleClose = () => {
    setError('')
    reset()
    setActiveStep(0)
    closeRegisterModal()
  }

  const switchToLogin = () => {
    handleClose()
    openLoginModal()
  }

  return (
    <Dialog
      open={registerModalOpen}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogContent sx={{ p: { xs: 3, sm: 4 }, position: 'relative' }}>
        <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 12, right: 12, color: '#999' }}>
          <Close />
        </IconButton>

        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box sx={{
            width: 56, height: 56, borderRadius: '50%', background: '#dc454d',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 2,
          }}>
            <MusicNote sx={{ fontSize: 28, color: '#fff' }} />
          </Box>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 700, color: '#282d35' }}>
            Crear cuenta
          </Typography>
          <Typography variant="body2" sx={{ color: '#888', mt: 0.5 }}>
            Únete a la comunidad BandUp
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 3 }} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel StepIconProps={{ sx: { '&.Mui-active': { color: '#dc454d' }, '&.Mui-completed': { color: '#dc454d' } } }}>
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {activeStep === 0 ? (
            <>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Nombre"
                    fullWidth
                    {...register('nombre', { required: 'Requerido' })}
                    error={!!errors.nombre}
                    helperText={errors.nombre?.message}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Badge sx={{ color: '#aaa', fontSize: 20 }} /></InputAdornment> }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&.Mui-focused fieldset': { borderColor: '#dc454d' } }, '& .MuiInputLabel-root.Mui-focused': { color: '#dc454d' } }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Apellido"
                    fullWidth
                    {...register('apellido')}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&.Mui-focused fieldset': { borderColor: '#dc454d' } }, '& .MuiInputLabel-root.Mui-focused': { color: '#dc454d' } }}
                  />
                </Grid>
              </Grid>
              <BtnAuth onClick={handleNext} sx={{ mt: 1 }}>
                Siguiente
              </BtnAuth>
            </>
          ) : (
            <>
              <TextField
                label="Usuario"
                {...register('username', { required: 'El usuario es requerido' })}
                error={!!errors.username}
                helperText={errors.username?.message}
                InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ color: '#aaa' }} /></InputAdornment> }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&.Mui-focused fieldset': { borderColor: '#dc454d' } }, '& .MuiInputLabel-root.Mui-focused': { color: '#dc454d' } }}
              />
              <TextField
                label="Email"
                type="email"
                {...register('email', { required: 'El email es requerido', pattern: { value: /^\S+@\S+$/i, message: 'Email inválido' } })}
                error={!!errors.email}
                helperText={errors.email?.message}
                InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: '#aaa' }} /></InputAdornment> }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&.Mui-focused fieldset': { borderColor: '#dc454d' } }, '& .MuiInputLabel-root.Mui-focused': { color: '#dc454d' } }}
              />
              <TextField
                label="Contraseña"
                type="password"
                {...register('password', { required: 'Requerida', minLength: { value: 8, message: 'Mínimo 8 caracteres' } })}
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{ startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#aaa' }} /></InputAdornment> }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&.Mui-focused fieldset': { borderColor: '#dc454d' } }, '& .MuiInputLabel-root.Mui-focused': { color: '#dc454d' } }}
              />
              <TextField
                label="Confirmar contraseña"
                type="password"
                {...register('confirm_password', { required: 'Confirma tu contraseña', validate: (val) => val === watch('password') || 'No coinciden' })}
                error={!!errors.confirm_password}
                helperText={errors.confirm_password?.message}
                InputProps={{ startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#aaa' }} /></InputAdornment> }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&.Mui-focused fieldset': { borderColor: '#dc454d' } }, '& .MuiInputLabel-root.Mui-focused': { color: '#dc454d' } }}
              />
              <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
                <BtnOutlined
                  onClick={() => setActiveStep(0)}
                  size="large"
                  sx={{ flex: 1, py: 1.4, borderRadius: '6px' }}
                >
                  Atrás
                </BtnOutlined>
                <BtnAuth
                  type="submit"
                  disabled={isSubmitting}
                  sx={{ flex: 2 }}
                >
                  {isSubmitting ? 'Creando...' : 'Crear cuenta'}
                </BtnAuth>
              </Box>
            </>
          )}
        </Box>

        <Typography sx={{ color: 'text.secondary', textAlign: 'center', mt: 3, fontSize: '0.875rem' }}>
          ¿Ya tienes cuenta?{' '}
          <Box component="span" onClick={switchToLogin} sx={{ color: 'secondary.main', fontWeight: 600, cursor: 'pointer' }}>
            Inicia sesión
          </Box>
        </Typography>
      </DialogContent>
    </Dialog>
  )
}

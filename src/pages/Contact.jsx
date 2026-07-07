import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Container, Paper, TextField, Button, Typography, Alert, Box } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'

export default function Contact() {
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async () => {
    await new Promise(r => setTimeout(r, 500))
    setSent(true)
  }

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>
        Contacto
      </Typography>

      {sent ? (
        <Alert severity="success" sx={{ mt: 2 }}>
          ¡Mensaje enviado! Te responderemos pronto.
        </Alert>
      ) : (
        <Paper elevation={2} sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Nombre"
              {...register('nombre', { required: 'Tu nombre es requerido' })}
              error={!!errors.nombre}
              helperText={errors.nombre?.message}
            />
            <TextField
              label="Email"
              type="email"
              {...register('email', {
                required: 'El email es requerido',
                pattern: { value: /^\S+@\S+$/i, message: 'Email inválido' }
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              label="Mensaje"
              multiline
              rows={5}
              {...register('mensaje', { required: 'Escribe un mensaje' })}
              error={!!errors.mensaje}
              helperText={errors.mensaje?.message}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              endIcon={<SendIcon />}
              disabled={isSubmitting}
            >
              Enviar mensaje
            </Button>
          </Box>
        </Paper>
      )}
    </Container>
  )
}

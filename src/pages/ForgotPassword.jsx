import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Container, Typography, TextField, Button, Box, Alert } from '@mui/material'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import { api } from '../services/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Ingresa tu correo electrónico')
      return
    }
    setLoading(true)
    setError('')
    try {
      await api.resetPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.error || err.message || 'Error al enviar el correo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
      <Box sx={{ width: '100%', maxWidth: 400 }}>
        {sent ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Box sx={{
              width: 56, height: 56, borderRadius: '50%', bgcolor: '#ecfdf5',
              display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2
            }}>
              <CheckCircleOutlinedIcon sx={{ fontSize: 26, color: '#059669' }} />
            </Box>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
              Revisa tu correo
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
              Enviamos instrucciones para restablecer tu contraseña a <strong>{email}</strong>
            </Typography>
            <Button
              component={Link}
              to="/"
              variant="contained"
              color="primary"
              size="small"
            >
              Volver al inicio
            </Button>
          </Box>
        ) : (
          <>
            <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>
              Recuperar contraseña
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Ingresa tu correo y te enviaremos un enlace para restablecerla.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2, fontSize: '0.82rem' }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Correo electrónico"
                type="email"
                size="small"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar instrucciones'}
              </Button>
            </Box>

            <Typography variant="body2" sx={{ mt: 2.5, textAlign: 'center', color: 'text.secondary' }}>
              <Link to="/login" style={{ color: '#282d35', fontWeight: 600, textDecoration: 'none' }}>
                Volver al inicio de sesión
              </Link>
            </Typography>
          </>
        )}
      </Box>
    </Container>
  )
}

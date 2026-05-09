import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Alert
} from '@mui/material'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')
    setSuccess('')

    if (!password || !confirmPassword) {
      setError('Completa todos los campos')
      return
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    try {
      setLoading(true)

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/reset-password/confirm`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email,
            token,
            password
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar contraseña')
      }

      setSuccess('Contraseña actualizada correctamente')

      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Restablecer contraseña
        </Typography>

        <Typography variant="body2" sx={{ mb: 3 }}>
          {email}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Nueva contraseña"
            type="password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <TextField
            fullWidth
            label="Confirmar contraseña"
            type="password"
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ mt: 3 }}
          >
            {loading ? 'Actualizando...' : 'Actualizar contraseña'}
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}
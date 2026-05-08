import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Box, CircularProgress } from '@mui/material'

export default function PrivateRoute({ children }) {
  const { user, loading, openLoginModal } = useAuth()

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress size={28} sx={{ color: '#282d35' }} />
      </Box>
    )
  }

  if (!user) {
    openLoginModal()
    return <Navigate to="/" replace />
  }

  return children
}

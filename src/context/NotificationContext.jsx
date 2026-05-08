import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { Snackbar, Alert, Slide } from '@mui/material'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'

const NotificationContext = createContext(null)

const ICONS = {
  success: <CheckCircleOutlinedIcon fontSize="small" />,
  info: <InfoOutlinedIcon fontSize="small" />,
  error: <ErrorOutlinedIcon fontSize="small" />,
  warning: <WarningAmberIcon fontSize="small" />,
}

function SlideFromRight(props) {
  return <Slide {...props} direction="left" />
}

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' })

  const notify = useCallback((message, severity = 'success') => {
    setNotification({ open: true, message, severity })
  }, [])

  const handleClose = (_, reason) => {
    if (reason === 'clickaway') return
    setNotification(prev => ({ ...prev, open: false }))
  }

  const value = useMemo(() => ({ notify }), [notify])

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        TransitionComponent={SlideFromRight}
        disableWindowBlurListener
        message={notification.message}
        sx={{
          position: 'fixed',
          top: 'calc(var(--header-height, 64px) + 12px) !important',
          right: 16,
          left: 'auto !important',
          zIndex: 1100,
        }}
      >
        <Alert
          onClose={handleClose}
          severity={notification.severity}
          variant="filled"
          icon={ICONS[notification.severity]}
          sx={{
            minWidth: 250, borderRadius: 2, fontWeight: 600, fontSize: '0.85rem',
            ...(notification.severity === 'info' && { bgcolor: '#282d35' }),
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) throw new Error('useNotification must be used within NotificationProvider')
  return context
}

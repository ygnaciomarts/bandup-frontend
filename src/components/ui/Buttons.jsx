import { forwardRef } from 'react'
import { Button as MuiButton } from '@mui/material'

// =============================================
// SISTEMA DE BOTONES — 4 variantes
// =============================================

// 1. PRIMARY — Acción principal, solid dark
// Uso: "Agregar al carrito", "Confirmar orden", "Ver catálogo"
export const BtnPrimary = forwardRef(function BtnPrimary({ children, ...props }, ref) {
  return (
    <MuiButton
      ref={ref}
      variant="contained"
      {...props}
      sx={{
        fontWeight: 700,
        fontSize: '0.85rem',
        px: 3,
        py: 1.2,
        borderRadius: 50,
        textTransform: 'none',
        bgcolor: '#1a1a1a',
        color: '#fff',
        boxShadow: 'none',
        '&:hover': {
          bgcolor: '#333',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        },
        '&:disabled': {
          bgcolor: '#e5e5e5',
          color: '#9ca3af',
        },
        ...props.sx,
      }}
    >
      {children}
    </MuiButton>
  )
})

// 2. ACCENT — Acción destacada, solid rojo
// Uso: "Comprar ahora", "Pagar", CTAs de urgencia
export const BtnAccent = forwardRef(function BtnAccent({ children, ...props }, ref) {
  return (
    <MuiButton
      ref={ref}
      variant="contained"
      {...props}
      sx={{
        fontWeight: 700,
        fontSize: '0.85rem',
        px: 3,
        py: 1.2,
        borderRadius: 50,
        textTransform: 'none',
        bgcolor: '#dc454d',
        color: '#fff',
        boxShadow: 'none',
        '&:hover': {
          bgcolor: '#c03a42',
          boxShadow: '0 4px 12px rgba(220,69,77,0.25)',
        },
        '&:disabled': {
          bgcolor: '#e5e5e5',
          color: '#9ca3af',
        },
        ...props.sx,
      }}
    >
      {children}
    </MuiButton>
  )
})

// Alias: BtnAuth = BtnAccent (fullWidth + bigger for modals)
export const BtnAuth = forwardRef(function BtnAuth({ children, ...props }, ref) {
  return (
    <BtnAccent
      ref={ref}
      fullWidth
      {...props}
      sx={{
        py: 1.4,
        fontSize: '0.9rem',
        ...props.sx,
      }}
    >
      {children}
    </BtnAccent>
  )
})

// 3. OUTLINED — Acción secundaria
// Uso: "Cancelar", "Atrás", "Cambiar"
export const BtnOutlined = forwardRef(function BtnOutlined({ children, ...props }, ref) {
  return (
    <MuiButton
      ref={ref}
      variant="outlined"
      {...props}
      sx={{
        fontWeight: 600,
        fontSize: '0.85rem',
        px: 3,
        py: 1.1,
        borderRadius: 50,
        textTransform: 'none',
        borderColor: '#d4d4d4',
        color: '#333',
        '&:hover': {
          borderColor: '#1a1a1a',
          bgcolor: '#fafafa',
        },
        ...props.sx,
      }}
    >
      {children}
    </MuiButton>
  )
})

// 4. TEXT — Acción terciaria / link
// Uso: "Ver todo", "Vaciar carrito", "¿Olvidaste tu contraseña?"
export const BtnText = forwardRef(function BtnText({ children, muted, ...props }, ref) {
  return (
    <MuiButton
      ref={ref}
      variant="text"
      size="small"
      {...props}
      sx={{
        fontWeight: 600,
        fontSize: '0.8rem',
        textTransform: 'none',
        borderRadius: 50,
        px: 1.5,
        color: muted ? '#9ca3af' : '#333',
        '&:hover': {
          bgcolor: '#f5f5f5',
          color: muted ? '#6b7280' : '#1a1a1a',
        },
        ...props.sx,
      }}
    >
      {children}
    </MuiButton>
  )
})

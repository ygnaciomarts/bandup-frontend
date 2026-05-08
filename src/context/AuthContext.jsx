import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { api } from '../services/api'
import { useNotification } from './NotificationContext'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const { notify } = useNotification()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [registerModalOpen, setRegisterModalOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.getMe()
        .then(setUser)
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (credentials) => {
    const data = await api.login(credentials)
    localStorage.setItem('token', data.token)
    localStorage.setItem('mockEmail', credentials.email || credentials.username)
    setUser(data.user)
    return data
  }, [])

  const register = useCallback(async (userData) => {
    const data = await api.register(userData)
    localStorage.setItem('token', data.token)
    localStorage.setItem('mockEmail', userData.email)
    setUser(data.user)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('mockEmail')
    setUser(null)
    notify('Tu sesión ha sido cerrada correctamente', 'info')
  }, [notify])

  const openLoginModal = useCallback(() => setLoginModalOpen(true), [])
  const closeLoginModal = useCallback(() => setLoginModalOpen(false), [])
  const openRegisterModal = useCallback(() => setRegisterModalOpen(true), [])
  const closeRegisterModal = useCallback(() => setRegisterModalOpen(false), [])

  const value = useMemo(() => ({ user, loading, login, register, logout, loginModalOpen, openLoginModal, closeLoginModal, registerModalOpen, openRegisterModal, closeRegisterModal }), [user, loading, login, register, logout, loginModalOpen, openLoginModal, closeLoginModal, registerModalOpen, openRegisterModal, closeRegisterModal])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

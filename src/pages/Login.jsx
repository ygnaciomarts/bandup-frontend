import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { openLoginModal } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    openLoginModal()
    navigate('/', { replace: true })
  }, [openLoginModal, navigate])

  return null
}

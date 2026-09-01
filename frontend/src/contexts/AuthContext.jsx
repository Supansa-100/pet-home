import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // ดึง token และเช็ค session เมื่อเปิดแอป
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('pethome_token')
      if (token) {
        try {
          // ดึงข้อมูล user จาก /api/auth/me
          const response = await api.get('/auth/me')
          if (response.data.success) {
            setUser(response.data.user)
          }
        } catch (error) {
          console.error('Session expired or invalid token', error)
          localStorage.removeItem('pethome_token')
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = (token, userData) => {
    localStorage.setItem('pethome_token', token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('pethome_token')
    setUser(null)
  }

  const value = {
    user,
    login,
    logout,
    loading,
    setUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

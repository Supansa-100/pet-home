import { Routes, Route } from 'react-router-dom'
import { Box, Container, Typography } from '@mui/material'

import Navbar from './components/layout/Navbar'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'

import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'

// Phase 3 Pages
import ListingsPage from './pages/ListingsPage'
import ListingDetailPage from './pages/ListingDetailPage'
import CreateListingPage from './pages/CreateListingPage'
import EditListingPage from './pages/EditListingPage'
import MyListingsPage from './pages/MyListingsPage'
import ChatListPage from './pages/ChatListPage'
import ChatRoomPage from './pages/ChatRoomPage'
import AdminDashboardPage from './pages/AdminDashboardPage'

// Phase 4 Pages
import MyRequestsPage from './pages/MyRequestsPage'
import IncomingRequestsPage from './pages/IncomingRequestsPage'

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/listings" element={<ListingsPage />} />
            <Route path="/listings/:id" element={<ListingDetailPage />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/listings/create" element={<CreateListingPage />} />
              <Route path="/listings/:id/edit" element={<EditListingPage />} />
              <Route path="/listings/:id/requests" element={<IncomingRequestsPage />} />
              <Route path="/my-listings" element={<MyListingsPage />} />
              <Route path="/my-requests" element={<MyRequestsPage />} />
              <Route path="/chat" element={<ChatListPage />} />
              <Route path="/chat/:roomId" element={<ChatRoomPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Box>
      </Box>
      </ToastProvider>
    </AuthProvider>
  )
}

function NotFoundPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h3" color="error">404</Typography>
      <Typography variant="h6">ไม่พบหน้าที่ต้องการ</Typography>
    </Container>
  )
}

export default App

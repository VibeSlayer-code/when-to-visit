import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Import page components
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import AddPlace from './pages/AddPlace';

// Import shared UI components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Main App component: handles routing and layout for the entire application
function App() {
  // Get loading state from authentication context
  const { loading } = useAuth();

  // Show a loading spinner while authentication state is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-t-4 border-primary-600 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  // Main app layout: Navbar, routed pages, and Footer
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation bar at the top */}
      <Navbar />
      {/* Main content area with page routing */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected routes: only accessible if logged in */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/add-place" 
            element={
              <ProtectedRoute>
                <AddPlace />
              </ProtectedRoute>
            } 
          />

          {/* Catch-all route: redirect any unknown path to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {/* Footer at the bottom */}
      <Footer />
    </div>
  );
}

export default App;

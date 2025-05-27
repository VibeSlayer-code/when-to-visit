import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearAllPlaces } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import Toast from './Toast';

// Only show debug button in development
const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Toast state
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [showToast, setShowToast] = useState(false);
  // Modal state
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      setToast({ message: 'Failed to log out', type: 'error' });
      setShowToast(true);
    }
  };

  const handleClearPlaces = async () => {
    setLoading(true);
    try {
      await clearAllPlaces();
      setToast({ message: 'All places cleared successfully.', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to clear places: ' + (err?.message || err), type: 'error' });
    } finally {
      setShowToast(true);
      setShowConfirm(false);
      setLoading(false);
    }
  };

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {isDev && (
            <button
              className="btn btn-secondary text-xs px-3 py-1 ml-2 border border-red-300 text-red-700 hover:bg-red-100 hover:border-red-500 transition"
              style={{ position: 'absolute', right: 16, top: 16, zIndex: 100 }}
              onClick={() => setShowConfirm(true)}
              title="Debug: Clear all places from database"
              disabled={loading}
            >
              {loading ? 'Clearing...' : 'Clear Places'}
            </button>
          )}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary-600">When To Visit</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-primary-600 transition-colors">
              Home
            </Link>
            {currentUser ? (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Dashboard
                </Link>
                <Link to="/add-place" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Add Place
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-gray-700 hover:text-primary-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              {currentUser ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-700 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/add-place"
                    className="text-gray-700 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Add Place
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="btn btn-secondary w-full"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-primary w-full text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
      {/* Toast notification */}
      {showToast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setShowToast(false)}
        />
      )}
      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm border text-center">
            <div className="text-xl font-semibold mb-2 text-red-600">Confirm Action</div>
            <div className="mb-4 text-gray-700">Are you sure you want to <b>CLEAR ALL PLACES</b>? This cannot be undone.</div>
            <div className="flex justify-center gap-3">
              <button className="btn btn-secondary" onClick={() => setShowConfirm(false)} disabled={loading}>Cancel</button>
              <button className="btn btn-primary bg-red-500 hover:bg-red-600" onClick={handleClearPlaces} disabled={loading}>
                {loading ? 'Clearing...' : 'Yes, Clear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;

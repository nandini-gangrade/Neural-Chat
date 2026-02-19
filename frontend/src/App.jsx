import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';

/**
 * PrivateRoute — only accessible when a user session exists in localStorage.
 * Redirects to /login if not authenticated.
 */
const PrivateRoute = ({ children }) => {
  const user = localStorage.getItem('nc_session');
  return user ? children : <Navigate to="/login" replace />;
};

/**
 * PublicRoute — only accessible when NOT logged in.
 * Redirects to /chat if already authenticated.
 */
const PublicRoute = ({ children }) => {
  const user = localStorage.getItem('nc_session');
  return user ? <Navigate to="/chat" replace /> : children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth pages — only for unauthenticated users */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Chat page — protected */}
        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

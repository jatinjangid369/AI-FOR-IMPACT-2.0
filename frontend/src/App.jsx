import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AppLayout from './layouts/AppLayout';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Complaints from './pages/complaints/Complaints';
import ComplaintDetail from './pages/complaints/ComplaintDetail';
import Maintenance from './pages/maintenance/Maintenance';
import LostFound from './pages/lostfound/LostFound';
import PolicyCenter from './pages/policies/PolicyCenter';
import Analytics from './pages/analytics/Analytics';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Unauthorized from './pages/Unauthorized';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Authentication Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Area */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/"
              element={
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              }
            />
            <Route
              path="/complaints"
              element={
                <AppLayout>
                  <Complaints />
                </AppLayout>
              }
            />
            <Route
              path="/complaints/:id"
              element={
                <AppLayout>
                  <ComplaintDetail />
                </AppLayout>
              }
            />
            <Route
              path="/maintenance"
              element={
                <AppLayout>
                  <Maintenance />
                </AppLayout>
              }
            />
            <Route
              path="/lost-found"
              element={
                <AppLayout>
                  <LostFound />
                </AppLayout>
              }
            />
            <Route
              path="/policies"
              element={
                <AppLayout>
                  <PolicyCenter />
                </AppLayout>
              }
            />
            <Route
              path="/profile"
              element={
                <AppLayout>
                  <Profile />
                </AppLayout>
              }
            />
            <Route
              path="/settings"
              element={
                <AppLayout>
                  <Settings />
                </AppLayout>
              }
            />
            <Route
              path="/unauthorized"
              element={
                <AppLayout>
                  <Unauthorized />
                </AppLayout>
              }
            />

            {/* Admin Only Route */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route
                path="/analytics"
                element={
                  <AppLayout>
                    <Analytics />
                  </AppLayout>
                }
              />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

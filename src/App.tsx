import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { AppLayout } from './components/AppLayout';
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { HomeEditorPage } from './pages/HomeEditor';
import { SermonsEditorPage } from './pages/SermonsEditor';
import { EventsEditorPage } from './pages/EventsEditor';
import { QuickActionsEditorPage } from './pages/QuickActionsEditor';
import { LinksEditorPage } from './pages/LinksEditor';
import { OnboardingEditorPage } from './pages/OnboardingEditor';
import { HistoryPage } from './pages/History';
import { UsersPage } from './pages/Users';
import { ImageLibraryPage } from './pages/ImageLibrary';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={
        <ProtectedRoute>
          <AppLayout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/home" element={<HomeEditorPage />} />
              <Route path="/sermons" element={<SermonsEditorPage />} />
              <Route path="/events" element={<EventsEditorPage />} />
              <Route path="/quick-actions" element={<QuickActionsEditorPage />} />
              <Route path="/links" element={<LinksEditorPage />} />
              <Route path="/onboarding" element={<OnboardingEditorPage />} />
              <Route path="/images" element={<ImageLibraryPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

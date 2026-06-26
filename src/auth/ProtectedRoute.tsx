import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { loading, session } = useAuth();

  if (loading) {
    return (
      <div className="center-panel">
        <div className="spinner" />
        <p>Loading ALFWC admin…</p>
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

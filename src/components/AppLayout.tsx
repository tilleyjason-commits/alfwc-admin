import { Link, NavLink, useLocation } from 'react-router-dom';
import { Church, History, Image as ImageIcon, LayoutDashboard, Link2, Megaphone, Settings, Users } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { canManageUsers } from '../lib/rbac';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/home', label: 'Home', icon: Church },
  { to: '/sermons', label: 'Sermons', icon: Megaphone },
  { to: '/events', label: 'Events', icon: History },
  { to: '/quick-actions', label: 'Quick actions', icon: LayoutDashboard },
  { to: '/links', label: 'Links', icon: Link2 },
  { to: '/onboarding', label: 'Onboarding', icon: Users },
  { to: '/images', label: 'Images', icon: ImageIcon },
  { to: '/history', label: 'History', icon: History },
  { to: '/users', label: 'Users', icon: Settings },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile, signOut, loading } = useAuth();
  const location = useLocation();
  const showUsers = canManageUsers(profile?.role);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/" className="brand">
          <Church size={28} />
          <span>
            <strong>ALFWC Admin</strong>
            <small>Church app content</small>
          </span>
        </Link>

        <nav className="nav-list" aria-label="Primary navigation">
          {navItems.filter((item) => item.to !== '/users' || showUsers).map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="profile-chip">
            <span className="avatar">{profile?.display_name?.[0]?.toUpperCase() ?? 'A'}</span>
            <div>
              <strong>{profile?.display_name ?? 'Admin'}</strong>
              <small>{profile?.role ?? (loading ? 'Loading role…' : 'No role')}</small>
            </div>
          </div>
          <button className="text-button" type="button" onClick={() => void signOut()}>Sign out</button>
        </div>
      </aside>

      <main className="main-content">
        <div className="mobile-topbar">
          <span>ALFWC Admin</span>
          <small>{location.pathname.replace('/', '') || 'Dashboard'}</small>
        </div>
        {children}
      </main>
    </div>
  );
}

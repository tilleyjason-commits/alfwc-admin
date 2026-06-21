import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { listAdminProfiles, updateAdminProfile } from '../lib/admin';
import { canManageUsers } from '../lib/rbac';
import type { AppRole } from '../lib/types';
import { SelectField } from '../components/forms';

type ProfileRow = {
  id: string;
  role: AppRole;
  display_name: string | null;
  created_at: string;
  updated_at: string;
  auth_users?: { email: string };
};

export function UsersPage() {
  const { profile, refreshProfile } = useAuth();
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const reload = async () => {
    const result = await listAdminProfiles();
    if (result.error) setError(result.error.message);
    else setRows(result.data as ProfileRow[]);
    setLoading(false);
  };

  useEffect(() => {
    void reload();
  }, []);

  const updateRole = async (id: string, role: AppRole) => {
    setError(null);
    setMessage(null);
    const result = await updateAdminProfile(id, { role });
    if (result.error) setError(result.error.message);
    else {
      setMessage('Role updated.');
      await reload();
      await refreshProfile();
    }
  };

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Users</p>
          <h1>Admin roles</h1>
          <p className="muted">Manage dashboard permissions for editors, publishers, and admins.</p>
        </div>
      </header>

      {!canManageUsers(profile?.role) ? (
        <div className="panel warning-panel">
          <ShieldCheck size={32} />
          <h2>Admin access required</h2>
          <p>Only admins can change user roles.</p>
        </div>
      ) : null}

      {error ? <div className="error-banner">{error}</div> : null}
      {message ? <div className="success-banner">{message}</div> : null}

      {loading ? <p className="muted">Loading users…</p> : (
        <section className="panel">
          <div className="user-table-wrap">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Updated</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.display_name ?? 'Unnamed admin'}</td>
                    <td>{row.auth_users?.email ?? 'No email'}</td>
                    <td>
                      {canManageUsers(profile?.role) ? (
                        <SelectField label="Role" value={row.role} onChange={(value) => void updateRole(row.id, value as AppRole)} options={[
                          { value: 'editor', label: 'Editor' },
                          { value: 'publisher', label: 'Publisher' },
                          { value: 'admin', label: 'Admin' },
                        ]} />
                      ) : row.role}
                    </td>
                    <td>{new Date(row.updated_at).toLocaleString()}</td>
                    <td>{row.role === 'admin' ? 'Admin' : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

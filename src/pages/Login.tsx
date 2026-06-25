import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Church } from 'lucide-react';
import { supabase } from '../lib/supabase';

const appBaseUrl = new URL(import.meta.env.BASE_URL, window.location.origin).toString();
const redirectTo = `${appBaseUrl}#/`;
const usernameEmailMap: Record<string, string> = {
  jtilley: 'tilley.jason@gmail.com',
};

function resolveLoginIdentifier(identifier: string) {
  const normalized = identifier.trim().toLowerCase();
  return usernameEmailMap[normalized] ?? normalized;
}

export function LoginPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function signInWithPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setStatus(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: resolveLoginIdentifier(identifier),
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setSubmitting(false);
      return;
    }

    setStatus('Signed in successfully. Loading dashboard…');
    setSubmitting(false);
    navigate('/', { replace: true });
  }

  async function signInWithGoogle() {
    setSubmitting(true);
    setError(null);
    setStatus(null);

    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });

    if (signInError) {
      setError(signInError.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <section className="login-card">
        <div className="login-hero">
          <Church size={54} />
          <h1>ALFWC Admin</h1>
          <p>Manage sermons, events, images, links, and app copy from one simple dashboard.</p>
        </div>

        <div className="auth-box">
          <form className="form-grid" onSubmit={signInWithPassword}>
            <label className="field" htmlFor="login-identifier">
              Username
              <input
                id="login-identifier"
                type="text"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="jtilley"
                autoComplete="username"
                required
              />
            </label>
            <label className="field" htmlFor="password">
              Password
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </label>
            <button className="button primary full" type="submit" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="muted login-help">You can sign in with username <strong>jtilley</strong> or your email address.</p>

          <div className="login-divider">or</div>

          <button className="button secondary full" type="button" onClick={signInWithGoogle} disabled={submitting}>
            Continue with Google
          </button>

          {status ? <p className="success-banner login-message">{status}</p> : null}
          {error ? <p className="error-banner login-message">{error}</p> : null}
        </div>
      </section>
    </div>
  );
}

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Church } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function LoginPage() {
  return (
    <div className="login-page">
      <section className="login-card">
        <div className="login-hero">
          <Church size={54} />
          <h1>ALFWC Admin</h1>
          <p>Manage sermons, events, images, links, and app copy from one simple dashboard.</p>
        </div>

        <div className="auth-box">
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa, variables: { default: { colors: { brand: '#1F497D', brandAccent: '#123A5A' } } } }}
            providers={['google']}
            magicLink
            redirectTo={window.location.origin}
            view="sign_in"
            showLinks
          />
        </div>
      </section>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const BrandOnboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const e = params.get('email');
    if (e) setEmail(e);

    // If Supabase auth redirected with tokens in the URL hash, try to parse them
    (async () => {
      try {
        const hash = window.location.hash;
        if (hash && (hash.includes('access_token') || hash.includes('error'))) {
          // let supabase parse the URL and establish the session if possible
          const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true });
          if (error) {
            // show error message extracted from URL if present
            const hashParams = new URLSearchParams(hash.replace('#', '?'));
            const errDesc = hashParams.get('error_description') || hashParams.get('error') || error.message;
            setMessage(decodeURIComponent(errDesc || 'Authentication failed'));
            return;
          }
          // if session created, populate email
          const user = data?.session?.user;
          if (user?.email) setEmail(user.email);
        }
      } catch (err: any) {
        // ignore and continue; we'll rely on useAuth for session
      }
    })();
  }, [location.search]);

  useEffect(() => {
    // If user is not signed in, show message instructing them to click the verification link
    if (!user) {
      // but if there's already an email param, show gentle instruction
      if (email) setMessage('Click the verification link sent to your brand email to continue onboarding.');
      else setMessage('Please click the verification link in your email first.');
    } else {
      setMessage('Verification successful. Please set a password to complete onboarding.');
      // prefill email with user email if available
      if (user.email) setEmail(user.email);
    }
  }, [user]);

  const handleSetPassword = async () => {
    if (!password || password.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      // Update user password and mark metadata as brand
      const { error } = await supabase.auth.updateUser({ password, data: { is_brand: true } });
      if (error) {
        setMessage(error.message);
      } else {
        setMessage('Onboarding complete. Redirecting...');
        setTimeout(() => navigate('/main'), 800);
      }
    } catch (err: any) {
      setMessage(err?.message || 'Failed to complete onboarding');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="max-w-md w-full p-6 rounded-lg bg-card border border-border">
        <h2 className="text-lg mb-2">Brand Onboarding</h2>
        <p className="text-sm text-muted-foreground mb-4">{message}</p>
        <div className="mb-3">
          <label className="text-xs text-muted-foreground">Email</label>
          <input className="w-full rounded-lg p-2 border border-input mt-1" value={email} readOnly />
        </div>
        <div className="mb-4">
          <label className="text-xs text-muted-foreground">Set password</label>
          <input type="password" className="w-full rounded-lg p-2 border border-input mt-1" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <button className="flex-1 bg-primary text-primary-foreground rounded-lg p-2" onClick={handleSetPassword} disabled={loading}>{loading ? 'Saving...' : 'Complete onboarding'}</button>
          <button className="flex-1 border rounded-lg p-2" onClick={() => navigate('/')}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default BrandOnboard;

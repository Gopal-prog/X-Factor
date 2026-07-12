import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldHalf, Lock, User, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const from = (location.state as { from?: Location })?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!username.trim() || !password.trim()) {
      setLocalError('Please enter both username and password.');
      return;
    }
    try {
      await login({ username, password });
      navigate(from, { replace: true });
    } catch {
      // error already set in context
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-accent/15 text-accent flex items-center justify-center mb-4">
            <ShieldHalf size={28} />
          </div>
          <h1 className="text-xl font-bold text-text">Cyber Digital Twin Platform</h1>
          <p className="text-sm text-muted mt-1">Sign in to your security workspace</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-xl shadow-black/20"
        >
          {(localError || error) && (
            <div className="rounded-lg border border-critical/40 bg-critical/10 px-3 py-2 text-sm text-critical">
              {localError || error}
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-xs font-medium text-muted mb-1.5">
              Username
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. jane.doe"
                className="w-full bg-surface-hover border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-text placeholder:text-muted focus-ring"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-muted mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface-hover border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-text placeholder:text-muted focus-ring"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-accent text-white py-2.5 text-sm font-semibold hover:bg-accent/90 transition-colors focus-ring disabled:opacity-60"
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            Sign in
          </button>

          <p className="text-xs text-muted text-center pt-1">
            Connects to <code className="text-accent">/auth/login</code>. If the backend is unreachable,
            any username/password will sign you into a demo session.
          </p>
        </form>
      </div>
    </div>
  );
}

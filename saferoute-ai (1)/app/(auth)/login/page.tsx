'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AlertTriangle, Eye, EyeOff, Loader2, Zap } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  async function handleDemoLogin() {
    setLoading(true);
    setError(null);
    // Demo credentials — create these in your Supabase project
    const { error } = await supabase.auth.signInWithPassword({
      email: 'demo@saferoute.ai',
      password: 'SafeRoute2024!',
    });
    if (error) {
      setError('Demo account not configured. Please sign up.');
      setLoading(false);
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="sr-card p-8 border-gradient">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
             style={{ background: 'linear-gradient(135deg, #00d4ff, #00ff88)' }}>
          <Zap className="w-5 h-5 text-black" />
        </div>
        <div>
          <div className="text-[17px] font-bold tracking-tight">
            Safe<span className="text-cyan-400">Route</span> AI
          </div>
          <div className="text-[11px] text-[#64748b]">Intelligent Disaster Routing</div>
        </div>
      </div>

      <h1 className="text-xl font-bold text-[#e2e8f0] mb-1">Welcome back</h1>
      <p className="text-[13px] text-[#64748b] mb-6">Sign in to access your safety dashboard</p>

      {error && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg mb-4
                        bg-red-500/10 border border-red-500/20 text-red-400 text-[12px]">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-[11px] font-medium text-[#64748b] uppercase tracking-wider mb-1.5">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="sr-input"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-[#64748b] uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="sr-input pr-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPass(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#94a3b8]"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary mt-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-[#1e2d47]" />
        <span className="text-[11px] text-[#64748b]">or</span>
        <div className="flex-1 h-px bg-[#1e2d47]" />
      </div>

      <button
        onClick={handleDemoLogin}
        disabled={loading}
        className="btn-secondary w-full"
      >
        <Zap className="w-4 h-4 text-cyan-400" />
        Continue with Demo Account
      </button>

      <p className="text-center text-[12px] text-[#64748b] mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-cyan-400 hover:text-cyan-300 font-medium">
          Sign up free
        </Link>
      </p>
    </div>
  );
}

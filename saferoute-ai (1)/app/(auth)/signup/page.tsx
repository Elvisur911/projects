'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AlertTriangle, CheckCircle2, Eye, EyeOff, Loader2, Zap } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [success, setSuccess]     = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    setLoading(false);
    if (error) { setError(error.message); return; }
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="sr-card p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-7 h-7 text-green-400" />
        </div>
        <h2 className="text-xl font-bold mb-2">Check your inbox</h2>
        <p className="text-[13px] text-[#64748b] mb-6">
          We sent a confirmation link to <strong className="text-[#e2e8f0]">{email}</strong>.
          Click it to activate your account.
        </p>
        <Link href="/login" className="btn-primary inline-flex w-full justify-center">
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="sr-card p-8 border-gradient">
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

      <h1 className="text-xl font-bold text-[#e2e8f0] mb-1">Create your account</h1>
      <p className="text-[13px] text-[#64748b] mb-6">Join thousands navigating safely through disasters</p>

      {error && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg mb-4
                        bg-red-500/10 border border-red-500/20 text-red-400 text-[12px]">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block text-[11px] font-medium text-[#64748b] uppercase tracking-wider mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className="sr-input"
            placeholder="Jane Wanjiku"
          />
        </div>

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
              minLength={8}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="sr-input pr-10"
              placeholder="Min. 8 characters"
            />
            <button
              type="button"
              onClick={() => setShowPass(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#94a3b8]"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {/* Password strength */}
          <div className="flex gap-1 mt-2">
            {[1,2,3,4].map(i => (
              <div key={i} className={`h-1 flex-1 rounded transition-colors ${
                password.length >= i * 3
                  ? i <= 1 ? 'bg-red-500' : i <= 2 ? 'bg-yellow-500' : i <= 3 ? 'bg-blue-400' : 'bg-green-400'
                  : 'bg-[#1e2d47]'
              }`} />
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary mt-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-[12px] text-[#64748b] mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}

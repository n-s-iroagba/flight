'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { adminLogin } from '../../../lib/api';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await adminLogin({ email, password });
      if (response.success && response.data?.token) {
        localStorage.setItem('adminToken', response.data.token);
        router.push('/admin');
      } else {
        setError('Invalid credentials');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-dark">
      <div className="max-w-md w-full space-y-8 bg-slate-main p-8 rounded-2xl border border-border-slate shadow-2xl">
        <div className="text-center">
          <Lock className="mx-auto h-12 w-12 text-oxblood" />
          <h2 className="mt-6 text-3xl font-bold text-text-primary">Admin Access</h2>
          <p className="mt-2 text-sm text-text-secondary">Secure portal for staff only</p>
        </div>
        
        {error && (
          <div className="bg-red-error/10 border border-red-error text-red-error p-3 rounded text-sm text-center">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Email address</label>
              <input
                name="email"
                type="email"
                required
                className="w-full bg-slate-dark border border-border-slate rounded-lg p-3 text-text-primary focus:outline-none focus:border-oxblood"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Password</label>
              <input
                name="password"
                type="password"
                required
                className="w-full bg-slate-dark border border-border-slate rounded-lg p-3 text-text-primary focus:outline-none focus:border-oxblood"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-text-primary bg-oxblood hover:bg-oxblood-bright focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-oxblood disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

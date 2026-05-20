import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Key, User, ArrowRight, AlertCircle, CheckCircle2, Gamepad2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username || !password) {
      setError('Credentials required for access.');
      return;
    }

    try {
      if (isLogin) {
        const success = await login(username, password);
        if (!success) setError('Invalid username or credential token.');
      } else {
        if (password !== confirmPassword) {
          setError('Credentials do not match the secondary verification.');
          return;
        }
        const success = await register(username, password);
        if (!success) setError('Identification string already registered in database.');
        else setSuccess('Identification successfully committed to remote registry.');
      }
    } catch (e: any) {
      setError('System connection failure. Please retry.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #3B82F6 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20">
              <Gamepad2 className="w-7 h-7 text-white" />
            </div>
            <span className="font-black text-3xl tracking-tighter text-white uppercase italic">
              Game<span className="text-blue-500">Hub</span>
            </span>
          </div>
          <h2 className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">
            Integrated Access Gateway
          </h2>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-700/50 relative">
          <div className="h-2 w-full bg-blue-600" />
          
          <form onSubmit={handleSubmit} className="p-10 space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium placeholder:text-slate-400"
                />
              </div>

              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="password" 
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium placeholder:text-slate-400"
                />
              </div>

              {!isLogin && (
                <div className="relative">
                   <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="password" 
                    placeholder="Verify Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium placeholder:text-slate-400"
                  />
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold uppercase">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold uppercase">
                <CheckCircle2 className="w-4 h-4" />
                {success}
              </div>
            )}

            <button 
              type="submit"
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
            >
              {isLogin ? 'Grant Access' : 'Register Identifier'}
              <ArrowRight className="w-5 h-5" />
            </button>

            <div className="pt-4 text-center">
              <button 
                type="button"
                onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
                className="text-sm font-black text-red-600 uppercase tracking-widest hover:text-red-700 transition-colors"
              >
                {isLogin ? 'No Registry? Create Identification' : 'Return to Access Gateway'}
              </button>
            </div>
          </form>
        </div>

        <p className="mt-8 text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
          Security Protocol 4.1.14 // gamehub.net <br />
          Unauthorized access attempts are logged.
        </p>
      </div>
    </div>
  );
}

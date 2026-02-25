
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Mail, Lock, LogIn, Chrome } from 'lucide-react';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Revisa tu email para confirmar el registro.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border-2 border-slate-100 dark:border-slate-800">
        <div className="text-center mb-10">
          <div className="bg-correo-yellow w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-correo-yellow/20">
             <LogIn className="w-8 h-8 text-correo-blue" />
          </div>
          <h2 className="text-3xl font-black text-correo-blue dark:text-white uppercase tracking-tighter">Terminal Operativa</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Acceso al Sistema Correo Argentino</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Legajo Electrónico (Email)</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-correo-yellow rounded-2xl pl-12 pr-4 py-4 dark:text-white outline-none transition-all"
                placeholder="usuario@correoargentino.com.ar"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Clave de Seguridad</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-correo-yellow rounded-2xl pl-12 pr-4 py-4 dark:text-white outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-correo-blue text-correo-yellow py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-correo-blue/20 hover:bg-correo-blue-light transition-all disabled:opacity-50"
          >
            {loading ? 'Validando...' : isSignUp ? 'Registrar Terminal' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-8">
          <div className="relative flex items-center justify-center mb-8">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full"></div>
            <span className="bg-white dark:bg-slate-900 px-4 text-[10px] font-black text-slate-400 uppercase absolute">O ingresar con</span>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 py-4 rounded-2xl font-black text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all uppercase text-[10px] tracking-widest"
          >
            <Chrome className="w-5 h-5 text-red-500" />
            Cuenta Oficial Google
          </button>
        </div>

        <p className="mt-8 text-center text-xs font-bold text-slate-400">
          {isSignUp ? '¿Ya tienes acceso?' : '¿No tienes cuenta oficial?'} 
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="ml-2 text-correo-blue dark:text-correo-yellow hover:underline"
          >
            {isSignUp ? 'Inicia Sesión' : 'Solicitar Acceso'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;

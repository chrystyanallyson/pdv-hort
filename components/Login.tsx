
import React, { useState } from 'react';
import { Logo } from '../constants';
import { supabase } from '../supabaseClient';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        onLogin();
      }
    } else {
      if (password !== confirmPassword) {
        setError('As senhas não coincidem.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres.');
        setLoading(false);
        return;
      }
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess('Cadastro realizado com sucesso! Faça login.');
        setIsLogin(true);
        setPassword('');
        setConfirmPassword('');
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#00a859] flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-emerald-400/20">
        <div className="text-center mb-10">
          <Logo />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Email de Acesso</label>
            <input
              type="email"
              className="w-full px-5 py-4 bg-white border-2 border-slate-300 rounded-xl focus:border-[#00a859] focus:ring-4 focus:ring-emerald-50 transition-all outline-none text-slate-900 font-bold placeholder-slate-400"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Senha Privada</label>
            <input
              type="password"
              className="w-full px-5 py-4 bg-white border-2 border-slate-300 rounded-xl focus:border-[#00a859] focus:ring-4 focus:ring-emerald-50 transition-all outline-none text-slate-900 font-bold placeholder-slate-400"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {!isLogin && (
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Confirmar Senha</label>
              <input
                type="password"
                className="w-full px-5 py-4 bg-white border-2 border-slate-300 rounded-xl focus:border-[#00a859] focus:ring-4 focus:ring-emerald-50 transition-all outline-none text-slate-900 font-bold placeholder-slate-400"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}
          
          {error && <p className="text-red-600 text-sm font-black text-center bg-red-50 py-2 rounded-lg">{error}</p>}
          {success && <p className="text-emerald-600 text-sm font-black text-center bg-emerald-50 py-2 rounded-lg">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00a859] hover:bg-[#00904d] disabled:opacity-50 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-green-200 active:scale-[0.97] uppercase tracking-widest text-sm"
          >
            {loading ? 'Aguarde...' : (isLogin ? 'Abrir Caixa' : 'Cadastrar')}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccess('');
              setPassword('');
              setConfirmPassword('');
            }}
            className="text-sm font-bold text-emerald-600 hover:text-emerald-800 transition-colors"
          >
            {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
          </button>
        </div>
        
        <p className="mt-10 text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          SisteMaster © 2024
        </p>
      </div>
    </div>
  );
};

export default Login;

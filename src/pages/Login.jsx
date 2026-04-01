import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Info, LogIn } from 'lucide-react';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login, currentUser, userData } = useAuth();

  if (currentUser && userData) {
    if (userData.role === 'superadmin') return <Navigate to="/superadmin" replace />;
    if (userData.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/voting" replace />;
  }

  const handleLogin = async (e) => {
    e?.preventDefault();
    setIsLoading(true);
    try {
      await login();
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-blue-200 p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 transition-all">
        <div className="w-full relative bg-white">
          <img 
            src="/NssSceBanner.webp" 
            alt="NSS SCE Banner" 
            className="w-full h-auto object-contain"
          />
        </div>
        <div className="px-8 py-6 text-center space-y-2 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900 text-white border-t border-blue-800/50 shadow-inner">
          <h1 className="text-2xl font-bold tracking-tight">NSS SCE</h1>
          <p className="text-blue-200 font-medium tracking-wide text-sm text-balance">2k26-27 PR Selection and POC Recommendation Portal</p>
        </div>
        
        <div className="p-8">
          <div className="space-y-6">
            <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-5 flex items-start space-x-3.5 shadow-sm text-left">
              <Info className="text-slate-500 mt-0.5 shrink-0" size={22} />
              <div>
                <h3 className="text-base font-semibold text-slate-800">Voting Instructions</h3>
                <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                  Please proceed to cast your vote carefully. Each vote is securely recorded. <strong className="font-semibold text-slate-900">Use your official KIIT Gmail</strong> to sign in.
                </p>
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Sign in with KIIT Gmail</span>
                </>
              )}
            </button>
            <div className="text-center">
              <p className="text-xs text-slate-500 mt-2">
                By logging in, you agree to the voting guidelines.
              </p>
            </div>
          </div>
          

        </div>
      </div>
    </div>
  );
};

export default Login;

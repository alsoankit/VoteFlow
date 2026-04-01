import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { LogOut, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserLayout = ({ children }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  // Apply dark mode class to html element and save preference
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = async (e) => {
    // Fallback for browsers that don't support View Transitions
    if (!document.startViewTransition) {
      setDarkMode(!darkMode);
      document.documentElement.classList.toggle('dark');
      return;
    }

    // Force the origin point to be near the top right (where the button is)
    const startX = e.clientX;
    const startY = e.clientY;
    
    // Calculate distance to the furthest corner (bottom-left) to ensure full coverage
    const maxRadius = Math.hypot(startX, window.innerHeight - startY);

    const isDark = document.documentElement.classList.contains('dark');
    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setDarkMode(!isDark);
      });
      if (!isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${startX}px ${startY}px)`,
        `circle(${maxRadius}px at ${startX}px ${startY}px)`,
      ];

      document.documentElement.animate(
        {
          clipPath: isDark ? [...clipPath].reverse() : clipPath,
        },
        {
          duration: 500,
          easing: 'ease-in-out',
          pseudoElement: isDark ? '::view-transition-old(root)' : '::view-transition-new(root)',
        }
      );
    });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const project = "NSS SCE";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-indigo-100 to-blue-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-slate-200/50 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-400 tracking-tight">
                NSS SCE
              </h1>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={toggleDarkMode}
                className="p-2 sm:px-3 sm:py-2 flex items-center text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400 rounded-xl transition-colors"
                title="Toggle Theme"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 dark:text-slate-300 dark:hover:bg-red-900/30 dark:hover:text-red-400 rounded-xl transition-colors font-medium text-sm"
                title="Logout"
              >
                <span className="hidden sm:inline">Logout</span>
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
};

export default UserLayout;

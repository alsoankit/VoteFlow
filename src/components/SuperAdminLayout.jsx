import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Database, Settings, LogOut, Menu, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

const SuperAdminLayout = ({ children, selectedView, setSelectedView }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = async () => {
    if (!document.startViewTransition) {
      setDarkMode(!darkMode);
      return;
    }

    await document.startViewTransition(() => {
      // Force DOM update synchronously inside the view transition
      import('react-dom').then(({ flushSync }) => {
        flushSync(() => {
          setDarkMode(!darkMode);
        });
      });
    }).ready;
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const q = query(
          collection(db, "projects"),
          orderBy("order")
        );

        const snap = await getDocs(q);
        const projectList = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setProjects(projectList);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        setErrorMsg(err.message || "Failed to fetch projects");
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row transition-colors duration-300">
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900/95 backdrop-blur-md border-b border-slate-800 p-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="font-bold text-lg text-white">Super Admin</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-300">
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar Navigation */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800/50 transform transition-all duration-300 ease-in-out md:sticky md:top-0 md:h-screen flex flex-col shadow-2xl
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 hidden md:block">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">SuperAdmin<br/><span className="text-primary-600 dark:text-primary-400 text-sm">System Console</span></h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-4 md:mt-0 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 dark:scrollbar-track-slate-900/50">
          
          <p className="text-xs font-bold uppercase text-slate-500 mb-2 px-4 tracking-wider">
            Views
          </p>

          <button
            onClick={() => {
              setSelectedView("overview");
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden ${
              selectedView === "overview" 
                ? 'bg-primary-50 dark:bg-primary-600/10 text-primary-700 dark:text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' 
                : 'hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {selectedView === "overview" && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-600 dark:bg-primary-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
            )}
            <LayoutDashboard size={20} className={`transition-colors duration-200 ${selectedView === "overview" ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 group-hover:text-slate-400'}`} />
            <span>All Projects Overview</span>
            
            {/* Ambient Background Glow when Active */}
            {selectedView === "overview" && (
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-transparent pointer-events-none dark:opacity-100 opacity-50" />
            )}
          </button>

          {/* Added visual separator instead of textual header */}
          <div className="my-2 border-t border-slate-200 dark:border-slate-800/50 mx-2" />

          {projects.map(project => (
            <button
              key={project.id}
              onClick={() => {
                setSelectedView(project.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden group ${
                selectedView === project.id
                  ? "bg-primary-50 dark:bg-primary-600/10 text-primary-700 dark:text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                  : "hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white text-slate-600 dark:text-slate-400"
              }`}
            >
              {selectedView === project.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-600 dark:bg-primary-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
              )}
              
              <div className={`w-2 h-2 rounded-full transition-colors duration-200 shadow-sm ${
                selectedView === project.id 
                  ? 'bg-primary-500 dark:bg-primary-400 shadow-[0_0_8px_rgba(59,130,246,0.5)] dark:shadow-[0_0_8px_rgba(96,165,250,0.8)]' 
                  : 'bg-slate-400 dark:bg-slate-700 group-hover:bg-slate-500'
              }`}></div>
              <span className="truncate">{project.name}</span>

              {/* Ambient Background Glow when Active */}
              {selectedView === project.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-transparent pointer-events-none dark:opacity-100 opacity-50" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2 bg-slate-50/50 dark:bg-transparent">
          <button 
            onClick={toggleDarkMode}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
          >
            <div className="flex items-center space-x-3">
              {darkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-slate-600" />}
              <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
          </button>
          
          <button 
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-slate-800 dark:hover:text-red-400 transition-colors group"
          >
            <LogOut size={20} className="group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors" />
            <span>Sign out</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-blue-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Back-drop overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/80 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default SuperAdminLayout;

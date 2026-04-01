import React, { useState, useEffect } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import SuperAdminLayout from '../components/SuperAdminLayout';
import GlobalOverview from '../components/GlobalOverview';
import ProjectDetail from '../components/ProjectDetail';
import { Loader2, Hash, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SuperAdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [votesPR, setVotesPR] = useState([]);
  const [votesPOC, setVotesPOC] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState("overview");
  const { userData, currentUser } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Fetch all users for name mapping
      const usersSnap = await getDocs(collection(db, "users"));
      const userList = usersSnap.docs.map(doc => doc.data());
      setUsers(userList);

      // Fetch PR votes
      const prSnap = await getDocs(collection(db, "votes_PR"));
      const prList = prSnap.docs.map(doc => ({id: doc.id, ...doc.data()}));
      setVotesPR(prList);

      // Fetch POC votes
      const pocSnap = await getDocs(collection(db, "votes_POC"));
      const pocList = pocSnap.docs.map(doc => ({id: doc.id, ...doc.data()}));
      setVotesPOC(pocList);

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <SuperAdminLayout selectedView={selectedView} setSelectedView={setSelectedView}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout selectedView={selectedView} setSelectedView={setSelectedView}>
      
      {/* Super Admin Info Card */}
      <div className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl p-5 md:p-8 flex flex-row items-center md:items-start gap-4 md:gap-6 shadow-xl border border-slate-200 dark:border-slate-700/50 mb-8 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 absolute top-0 left-0 right-0" />
        
        {/* NSS Logo Avatar */}
        <div className="relative shrink-0 group">
          <div className="w-16 h-16 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-white dark:bg-slate-900 border-4 border-white dark:border-slate-800 shadow-lg group-hover:scale-105 transition-transform duration-300">
            <img 
              src="/nsslogo.png" 
              alt="NSS Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-primary-600 text-white p-2 rounded-full shadow-lg border-2 border-white dark:border-slate-800">
            <Users size={16} />
          </div>
        </div>

        {/* User Stats/Info */}
        <div className="flex-1 text-left pt-1 md:pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold tracking-wider uppercase mb-2 md:mb-3 border border-blue-200/50 dark:border-blue-800/50">
            System Administrator
          </div>
          
          <h1 className="text-xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2 md:mb-4 truncate max-w-[200px] sm:max-w-none">
            {userData?.name || "Loading..."}
          </h1>
          
          <div className="flex flex-col sm:flex-row items-start md:items-center justify-start gap-2 md:gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium border border-slate-200 dark:border-slate-700 shadow-sm">
              <Hash size={14} className="text-indigo-500 dark:text-slate-400" />
              {userData?.rollNumber || (currentUser?.email ? currentUser.email.split('@')[0] : "N/A")}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm font-medium border border-emerald-200/50 dark:border-emerald-800/50 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ring-2 ring-emerald-500/30"></div>
              Superadmin Console
            </span>
          </div>
        </div>
      </div>

      {selectedView === "overview" && (
        <GlobalOverview
          users={users}
          votesPR={votesPR}
          votesPOC={votesPOC}
        />
      )}

      {selectedView !== "overview" && (
        <ProjectDetail
          projectId={selectedView}
          users={users}
          votesPR={votesPR}
          votesPOC={votesPOC}
        />
      )}
    </SuperAdminLayout>
  );
};

export default SuperAdminDashboard;
